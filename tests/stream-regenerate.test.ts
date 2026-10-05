import path from "node:path";
import { getCorpus } from "../bench/_shared.ts";
import { createRegistry, extendLines, registerAll } from "../src/engine.js";
import * as languages from "../src/languages/index.js";
import javascript from "../src/languages/javascript.js";
import { createCompletedHtmlBuffer } from "../src/stream-highlighted.js";
import {
  extendLinesAfterPatch,
  regenerate,
  walkStart,
} from "../src/stream-regenerate.js";
import {
  buildSealedChunkHtml,
  pushSealedChunk,
} from "../src/stream-sealed-chunks.js";
import { CUSTOM_SNIPPETS } from "./differential-corpus.ts";
import { loadComponents, type Mounted, mountComponent } from "./svelte-dom.ts";

const { HighlightStream } = await loadComponents(
  path.join(import.meta.dir, "../src"),
  ["HighlightStream"],
);

const registry = createRegistry();
for (const language of Object.values(languages)) {
  registerAll(registry, language as Parameters<typeof registerAll>[1]);
}

// Small chunks, so short snippets still cross many chunk boundaries.
const CHUNK_LINES = 3;

function seal(lines: string[], from = 0) {
  let chunks: string[] = [];
  let sealedLineCount = from;
  let unsealedLines = lines;
  while (unsealedLines.length >= CHUNK_LINES) {
    chunks = pushSealedChunk(
      chunks,
      buildSealedChunkHtml(
        unsealedLines.slice(0, CHUNK_LINES),
        sealedLineCount,
      ),
    );
    sealedLineCount += CHUNK_LINES;
    unsealedLines = unsealedLines.slice(CHUNK_LINES);
  }
  return { chunks, sealedLineCount, unsealedLines };
}

/** A stream fed `code` in small chunks, rendered the way HighlightStream
 * renders it. */
function streamed(language: string, code: string) {
  const session = registry.createSession(language);
  for (let i = 0; i < code.length; i += 7) session.append(code.slice(i, i + 7));
  const { completedLines } = extendLines(session.events(), [], "");
  const completedHtml = createCompletedHtmlBuffer();
  completedHtml.appendLines(completedLines);
  return {
    session,
    fedCode: code,
    sealedChunks: seal(completedLines).chunks,
    completedHtml,
  };
}

/** What regenerate rendered before it kept sealed chunks: every line,
 * from the patched session's events. */
function fullRebuild(events: Parameters<typeof extendLines>[0]) {
  const result = extendLines(events, [], "");
  const sealed = seal(result.completedLines);
  return {
    sealedChunks: sealed.chunks,
    sealedLineCount: sealed.sealedLineCount,
    unsealedLines: sealed.unsealedLines,
    pendingHtml: result.pendingHtml,
    openScopes: result.openScopes,
    committedCount: events.length,
    completed: result.completedLines.join("\n"),
  };
}

function regenerateTo(stream: ReturnType<typeof streamed>, code: string) {
  const result = regenerate({ ...stream, code, chunkLines: CHUNK_LINES });
  stream.fedCode = code;
  stream.sealedChunks = result.sealedChunks;
  return { ...result, completed: stream.completedHtml.toString() };
}

// Rewrites `code` from `at` on with other text from the same language.
function rewriteFrom(code: string, at: number) {
  const head = code.slice(0, at);
  const tail = code.slice(at);
  return head + tail.split("\n").reverse().join("\n");
}

/** Regenerates `code`'s tail from several points, twice each (the second
 * patch starts from the engine's incremental parse, not the stream's), and
 * checks every result against a full rebuild. */
function expectSameAsFullRebuild(language: string, code: string) {
  for (const fraction of [0.3, 0.6, 0.9]) {
    const lineStart = code.lastIndexOf("\n", code.length * fraction) + 1;
    for (const at of [lineStart, Math.floor(code.length * fraction)]) {
      const stream = streamed(language, code);
      for (const next of [rewriteFrom(code, at), code]) {
        const result = regenerateTo(stream, next);
        expect({ language, at, ...result }).toEqual({
          language,
          at,
          ...fullRebuild(stream.session.events()),
        });
      }
    }
  }
}

describe("regenerate", () => {
  it("renders like a full rebuild for every language's snippet", () => {
    for (const [name, code] of Object.entries(CUSTOM_SNIPPETS)) {
      expectSameAsFullRebuild(name, code);
    }
  });

  it("renders like a full rebuild for multi-line constructs", () => {
    expectSameAsFullRebuild(
      "ruby",
      "a = 1\nb = <<~SQL\n  select *\n  from t\nSQL\nc = 2\nd = 3\ne = <<-EOS\n  x\n  EOS\nf = 4\n",
    );
    expectSameAsFullRebuild(
      "bash",
      "echo a\ncat <<EOF\none\ntwo\nEOF\necho b\necho c\ncat <<'END'\n$x\nEND\necho d\n",
    );
    expectSameAsFullRebuild(
      "javascript",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: a JS template literal in the highlighted source
      "const a = 1;\n/* one\ntwo\nthree */\nconst t = `x\n${a}\ny`;\nlet b = 2;\n// end\n",
    );
  });

  it("renders like a full rebuild on the bench corpora", async () => {
    const corpus = await getCorpus();
    for (const [language, text] of Object.entries(corpus)) {
      expectSameAsFullRebuild(language, text.slice(0, 6_000));
    }
  });

  it("keeps the sealed chunks before the change", () => {
    const code = Array.from(
      { length: 20 },
      (_, i) => `let v${i} = ${i};\n`,
    ).join("");
    const stream = streamed("javascript", code);
    const before = stream.sealedChunks;
    // Line 13 changes: chunks 0-3 (lines 0-11) end before it.
    regenerateTo(stream, code.replace("let v13 = 13;", "let v13 = 'x';"));
    expect(stream.sealedChunks.slice(0, 4)).toEqual(before.slice(0, 4));
    for (let i = 0; i < 4; i++) {
      expect(stream.sealedChunks[i]).toBe(before[i] as string);
    }
  });
});

describe("extendLinesAfterPatch", () => {
  const code = "a = `x\ny` + /* c\nd */ 1;\nb = 2;\n\nc = 3;\n";
  const session = registry.createSession("javascript");
  session.append(code);
  const events = session.events();
  const full = extendLines(events, [], "");
  const lineStarts: number[] = [];
  for (let i = code.indexOf("\n"); i !== -1; i = code.indexOf("\n", i + 1)) {
    if (i + 1 < code.length) lineStarts.push(i + 1);
  }

  it("matches extendLines from any line start", () => {
    lineStarts.forEach((at, i) => {
      expect(extendLinesAfterPatch(events, events, [at])).toEqual({
        kept: 1,
        result: { ...full, completedLines: full.completedLines.slice(i + 1) },
      });
    });
  });

  it("stops at the first event that changed", () => {
    // Every event from the second line's on differs.
    const secondLine = events.findIndex(
      (event) => event.t === 0 && event.v.includes("\n"),
    );
    const previous = events.map((event, i) =>
      i > secondLine ? { t: 0 as const, v: "changed" } : event,
    );
    expect(extendLinesAfterPatch(events, previous, lineStarts)).toEqual({
      kept: 1,
      result: { ...full, completedLines: full.completedLines.slice(1) },
    });
    expect(extendLinesAfterPatch(events, [], lineStarts)).toEqual({
      kept: 0,
      result: full,
    });
  });
});

describe("walkStart", () => {
  it("starts the walk later with the same result as from the top", () => {
    const code = Array.from({ length: 300 }, (_, i) =>
      i % 9 === 0 ? `/* ${i}\n*/` : `let v${i} = \`${i}\`;`,
    ).join("\n");
    const session = registry.createSession("javascript");
    session.append(`${code}\n`);
    let fed = `${code}\n`;
    let started = 0;
    for (const fraction of [0.9, 0.5, 0.95, 0.2]) {
      const previous = session.events();
      const at = fed.lastIndexOf("\n", fed.length * fraction) + 1;
      const kept = session.replace(at, at + 3, "x");
      fed = `${fed.slice(0, at)}x${fed.slice(at + 3)}`;
      // Every CHUNK_LINES-th line start before the change.
      const lineStarts: number[] = [];
      let line = 0;
      for (let i = fed.indexOf("\n"); i !== -1 && i < at; ) {
        if (++line % CHUNK_LINES === 0) lineStarts.push(i + 1);
        i = fed.indexOf("\n", i + 1);
      }
      const from = walkStart(session, kept, lineStarts);
      if (from) started++;
      const events = session.events();
      expect(extendLinesAfterPatch(events, previous, lineStarts, from)).toEqual(
        extendLinesAfterPatch(events, previous, lineStarts),
      );
    }
    expect(started).toBeGreaterThan(0);
  });
});

describe("HighlightStream regenerate", () => {
  const code = Array.from(
    { length: 700 },
    (_, i) => `const v${i} = \`line ${i}\`; // ${i}\n`,
  ).join("");
  const regenerated = code.replace("const v650 =", "let v650 =");

  // The `@html` nodes of the sealed chunks (256 lines each), in order: the
  // ones right in `<code>`, not in a tail line's `<span>`.
  function chunkNodes(stream: Mounted) {
    const nodes: object[] = [];
    const walk = (node: ChildNode | null) => {
      for (let n = node; n; n = n.nextSibling) {
        if (
          n.constructor.name === "FakeRawHtml" &&
          n.parentNode?.nodeName === "CODE"
        ) {
          nodes.push(n);
        }
        walk(n.firstChild);
      }
    };
    walk(stream.target.firstChild as unknown as ChildNode | null);
    return nodes;
  }

  it("keeps earlier sealed chunks' DOM and renders like a fresh stream", () => {
    const stream = mountComponent(HighlightStream, { language: javascript });
    stream.set({ code });
    const before = chunkNodes(stream);
    expect(before).toHaveLength(2);
    stream.set({ code: regenerated });
    const after = chunkNodes(stream);
    expect(after[0]).toBe(before[0] as object);
    expect(after[1]).toBe(before[1] as object);

    const fresh = mountComponent(HighlightStream, { language: javascript });
    fresh.set({ code: regenerated });
    expect(stream.target.innerHTML).toContain("let</span> v650");
    expect(stream.target.innerHTML).toBe(fresh.target.innerHTML);
    stream.destroy();
    fresh.destroy();
  });
});
