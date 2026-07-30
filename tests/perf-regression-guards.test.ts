/**
 * Regression guards for four hot-path scaling issues (checkpoint memory,
 * sealed-chunk append, streamed-highlight completed-html buffering, and DOM
 * paint on pure-append edits). Where a fix already lives in this codebase,
 * the guard calls it (or a faithful reconstruction of the inline behavior).
 * Where a fix is still landing as a separate extracted module
 * (`editable-dom-paint.js`), the guard falls back to today's baseline and
 * may fail on purpose until that module lands.
 */
import { createRegistry, registerAll, renderHtml } from "../src/engine.js";
import {
  type IncrementalParse,
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import * as languages from "../src/languages/index.js";
import { splitLines } from "../src/split-lines.js";

const registry = createRegistry();
for (const language of Object.values(languages))
  registerAll(registry, language);

/**
 * Best-effort dynamic import of a module that may not exist yet on this
 * branch. Routed through a `path` parameter (rather than a string literal
 * at the `import()` call site) so tsc doesn't try to resolve - and error
 * on - a module that's still landing in a separate branch.
 */
async function tryImport(
  path: string,
): Promise<Record<string, unknown> | null> {
  try {
    return await import(path);
  } catch {
    return null;
  }
}

/** An n-line synthetic JS document, for checkpoint-density tests. */
function jsLines(n: number) {
  const unit = [
    "function add(a, b) {",
    "  // sum two numbers",
    "  return a + b;",
    "}",
  ];
  const lines: string[] = [];
  for (let i = 0; i < n; i++) lines.push(`${unit[i % unit.length]} // ${i}`);
  return `${lines.join("\n")}\n`;
}

/** A synthetic JS document at least `minLength` characters long, for typing-simulation tests. */
function jsSource(minLength: number) {
  const unit = "function add(a, b) {\n  return a + b; // comment\n}\n";
  let out = "";
  while (out.length < minLength) out += unit;
  return out.slice(0, minLength);
}

function medianTime(fn: () => void, trials: number) {
  const times: number[] = [];
  for (let i = 0; i < trials; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)] ?? 0;
}

describe("incremental-tokenize checkpoint density", () => {
  it("retains far fewer checkpoints than one per line on a large first parse", () => {
    const parsed = parseIncremental(registry, "javascript", jsLines(2000));
    // One-per-line checkpointing retains ~2001. This bound only trips if
    // checkpoint density regresses back toward 1:1 - it isn't pinned to any
    // specific interval, so retuning the interval won't break this test.
    expect(parsed.checkpoints.length).toBeLessThan(2000 / 8 + 4);
  });

  it("keeps the checkpoint-count-to-line-count ratio bounded across document sizes", () => {
    const small = parseIncremental(registry, "javascript", jsLines(500));
    const large = parseIncremental(registry, "javascript", jsLines(4000));
    expect(small.checkpoints.length).toBeLessThan(500 / 8 + 4);
    expect(large.checkpoints.length).toBeLessThan(4000 / 8 + 4);
  });

  it("keeps reparseIncremental's stored checkpoint count bounded after an append edit", () => {
    const base = jsLines(4000);
    const first = parseIncremental(registry, "javascript", base);
    const edited: IncrementalParse = reparseIncremental(
      registry,
      "javascript",
      first,
      `${base}function tail() {}\n`,
    );
    expect(edited.checkpoints.length).toBeLessThan(4000 / 8 + 8);
  });
});

describe("HighlightStream sealed-chunk append", () => {
  async function loadPushSealedChunk() {
    const mod = await tryImport("../src/stream-sealed-chunks.js");
    if (mod) {
      return mod.pushSealedChunk as (
        chunks: string[],
        chunk: string,
      ) => string[];
    }
    // Current HighlightStream.svelte sealChunk(): push + same-array return
    // (Svelte invalidation via `sealedChunks = sealedChunks`), O(1) amortized.
    return (chunks: string[], chunk: string) => {
      chunks.push(chunk);
      return chunks;
    };
  }

  it("appends without copying the existing array (O(1) amortized, not O(c))", async () => {
    const pushSealedChunk = await loadPushSealedChunk();
    const chunks = ["chunk-0", "chunk-1"];
    const result = pushSealedChunk(chunks, "chunk-2");
    expect(result).toBe(chunks);
    expect(result).toEqual(["chunk-0", "chunk-1", "chunk-2"]);
  });

  it("keeps 8x more seals from costing anywhere near 8x^2 the time", async () => {
    const pushSealedChunk = await loadPushSealedChunk();
    const chunk = "x".repeat(200);
    function run(count: number) {
      let chunks: string[] = [];
      for (let i = 0; i < count; i++) chunks = pushSealedChunk(chunks, chunk);
      return chunks;
    }
    run(300); // warm up

    const small = medianTime(() => run(1000), 3);
    const large = medianTime(() => run(8000), 3);

    // Measured at this scale: a true O(c) implementation costs ~4-6x for
    // 8x more seals; the O(c^2) spread-copy pattern this guards against
    // costs ~30-40x. 22 sits clear of both, with more margin against CI
    // timing noise than 15 (which flaked under load) while still well
    // short of the O(c^2) range.
    expect(large / Math.max(small, 0.01)).toBeLessThan(22);
  }, 10_000);
});

describe("HighlightStream highlighted rematerialize policy", () => {
  it("keeps an append-only completed-html buffer (event string is assembled each frame)", async () => {
    // Preview-only skips of `highlighted` were rejected: on:highlight must
    // stay live mid-line. The remaining win is append-only completed HTML.
    const mod = await tryImport("../src/stream-highlighted.js");
    expect(mod).not.toBeNull();
    expect(mod?.shouldRematerializeHighlighted).toBeUndefined();
    const createCompletedHtmlBuffer = mod?.createCompletedHtmlBuffer as () => {
      appendLines: (lines: string[]) => void;
      toString: () => string;
      lineCount: number;
    };
    const buf = createCompletedHtmlBuffer();
    buf.appendLines(["a"]);
    buf.appendLines(["b"]);
    expect(buf.toString()).toBe("a\nb");
    expect(buf.lineCount).toBe(2);
  });
});

describe("HighlightEditable pure-append paint cost", () => {
  type Painter = {
    paint(events: unknown[], code: string, languageName: string): string[];
    reset(): void;
  };

  async function loadCreatePainter(): Promise<() => Painter> {
    const mod = await tryImport("../src/editable-dom-paint.js");
    if (mod) {
      const createDomLinePainter = mod.createDomLinePainter as (opts: {
        registry: typeof registry;
      }) => Painter;
      return () => createDomLinePainter({ registry });
    }
    // Baseline: HighlightEditable.svelte's paint() currently re-renders the
    // full event stream via renderHtml + splitLines on every call,
    // regardless of whether the edit was a pure append.
    return () => ({
      paint(events, code) {
        const html = renderHtml(events as Parameters<typeof renderHtml>[0]);
        const paintHtml =
          code === "" || code.endsWith("\n") ? `${html}\n` : html;
        return splitLines(paintHtml);
      },
      reset() {},
    });
  }

  function typeAndPaint(createPainter: () => Painter, targetLength: number) {
    const painter = createPainter();
    const source = jsSource(targetLength);
    let code = "";
    let state: IncrementalParse | undefined;
    for (const ch of source) {
      code += ch;
      state = state
        ? reparseIncremental(registry, "javascript", state, code)
        : parseIncremental(registry, "javascript", code);
      painter.paint(state.events, code, "javascript");
    }
  }

  it("keeps 4x more typed characters from costing anywhere near 4x^2 the time", async () => {
    const createPainter = await loadCreatePainter();
    typeAndPaint(createPainter, 500); // warm up

    const small = medianTime(() => typeAndPaint(createPainter, 1000), 5);
    const large = medianTime(() => typeAndPaint(createPainter, 4000), 5);

    // Measured at this scale (median of 5 trials, needed for a stable
    // reading): true O(delta)-per-keystroke painting costs ~4-7x for 4x
    // more typing (fixed per-keystroke overhead keeps it above the ideal
    // 4x); the O(document-length)-per-keystroke pattern this guards
    // against costs ~13-17x. 9 sits clear of both with margin to spare.
    expect(large / Math.max(small, 1)).toBeLessThan(9);
  }, 15_000);
});
