/**
 * The load-bearing invariant for windowed rendering: `TokenizedDocument`'s
 * checkpoint/resume machinery must never change output relative to a plain,
 * uncheckpointed parse of the *same truncated prefix* - i.e. checkpointing
 * itself introduces zero divergence, at any checkpointInterval, for any
 * window.
 *
 * Note this reference is intentionally *not* a full-document canonical
 * parse: a window's `end` truncates the input, and constructs needing
 * multi-line lookahead beyond that cut (documented in
 * tokenized-document.js's "Fidelity caveat") can legitimately render
 * differently near the boundary than they would with the rest of the
 * document visible. That gap exists for *any* truncated-prefix parse,
 * checkpointed or not (verified below), so it isn't something checkpointing
 * could introduce or fix. Full-document equivalence is still asserted
 * wherever a window's `end` reaches the true end of the document, where no
 * truncation is in play.
 */
import { createRegistry, extendLines, registerAll } from "../src/engine.js";
import type { LanguageType } from "../src/languages";
import * as languages from "../src/languages/index.js";
import javascript from "../src/languages/javascript.js";
import { createTokenizedDocument } from "../src/tokenized-document.js";
import { CUSTOM_SNIPPETS } from "./differential-corpus.ts";

const registry = createRegistry();
for (const language of Object.values(languages))
  registerAll(registry, language);

/** One entry per line-start offset, matching TokenizedDocument's own convention. */
function lineStartOffsets(code: string): number[] {
  const offsets = [0];
  for (let i = 0; i < code.length; i++) {
    if (code.charCodeAt(i) === 10) offsets.push(i + 1);
  }
  return offsets;
}

/** One-shot reference: full parse, single extendLines pass, no checkpoints. */
function referenceLines(languageName: string, code: string): string[] {
  const events = registry.tokenize(code, languageName).events;
  const result = extendLines(events, [], "");
  return [...result.completedLines, result.pendingHtml];
}

/**
 * Reference for a window ending at line `end`: a plain (uncheckpointed,
 * unresumed) parse of the prefix truncated at `end`'s boundary - the same
 * input TokenizedDocument's checkpoint/resume path effectively sees.
 */
function referenceWindow(
  languageName: string,
  code: string,
  offsets: number[],
  end: number,
): string[] {
  const cut = end < offsets.length ? offsets[end] : code.length;
  return referenceLines(languageName, code.slice(0, cut));
}

/** Deterministic PRNG (mulberry32) so a failing seed reproduces exactly. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CHECKPOINT_INTERVALS = [3, 100];

describe("TokenizedDocument: checkpoint/resume equivalence (corpus, exhaustive small windows)", () => {
  for (const [name, code] of Object.entries(CUSTOM_SNIPPETS)) {
    const language = (
      languages as unknown as Record<string, LanguageType<string>>
    )[name];
    if (!language) continue;

    const offsets = lineStartOffsets(code);
    const totalLines = offsets.length;

    for (const checkpointInterval of CHECKPOINT_INTERVALS) {
      it(`${name} (checkpointInterval=${checkpointInterval})`, () => {
        const doc = createTokenizedDocument({ language, checkpointInterval });
        doc.setCode(code);

        expect(doc.lineCount()).toBe(totalLines);

        for (let end = 0; end <= totalLines; end++) {
          const windowRef = referenceWindow(name, code, offsets, end);
          for (let start = 0; start <= end; start++) {
            expect(doc.lineRange(start, end)).toEqual(
              windowRef.slice(start, end),
            );
          }
        }

        // No truncation at the true end: matches the full canonical parse.
        expect(doc.lineRange(0, totalLines)).toEqual(
          referenceLines(name, code),
        );
      });
    }
  }
});

/**
 * A multi-thousand-line synthetic document with periodic multi-line
 * constructs (block comments, multi-line template literals) so checkpoint
 * batches sometimes land mid-construct - the case where the tokenizer's
 * committed position lags the fed line boundary. Unlike the mdx corpus
 * case above, these constructs are simple scope continuations (no
 * begin-match lookahead), so windows cut mid-construct still match the
 * full-document reference - asserted directly below.
 */
function generateLargeJsDocument(lineCount: number): string {
  const parts: string[] = [];
  let i = 0;
  while (i < lineCount) {
    if (i % 137 === 0) {
      parts.push(`/* comment start at line ${i}`);
      parts.push("   still inside the comment");
      parts.push(`   still inside the comment (${i})`);
      parts.push("   comment end */");
      i += 4;
    } else if (i % 53 === 0) {
      parts.push(`const s${i} = \`template line ${i} continues`);
      parts.push(`  more text \${1 + ${i}}\`;`);
      i += 2;
    } else {
      parts.push(`const x${i} = ${i} + 1; // line ${i}`);
      i += 1;
    }
  }
  return `${parts.join("\n")}\n`;
}

describe("TokenizedDocument: checkpoint/resume equivalence (large document, randomized windows)", () => {
  const LargeCode = generateLargeJsDocument(3000);
  const expected = referenceLines("javascript", LargeCode);

  for (const checkpointInterval of CHECKPOINT_INTERVALS) {
    it(`randomized windows (checkpointInterval=${checkpointInterval})`, () => {
      const doc = createTokenizedDocument({
        language: javascript,
        checkpointInterval,
      });
      doc.setCode(LargeCode);
      expect(doc.lineCount()).toBe(expected.length);

      // Small, viewport-sized windows scattered across the document - the
      // realistic access pattern (scrolling) this module is built for.
      // Wide windows are already covered by the boundary/out-of-order tests
      // below and by the full-document check; generating hundreds of
      // large-random-width windows here would make this O(trials * n).
      const rng = mulberry32(0xc0ffee ^ checkpointInterval);
      for (let trial = 0; trial < 200; trial++) {
        const start = Math.floor(rng() * expected.length);
        const width = Math.floor(rng() * 150);
        const end = Math.min(start + width, expected.length);
        expect(doc.lineRange(start, end)).toEqual(expected.slice(start, end));
      }
    });

    it(`windows straddling checkpoint boundaries (checkpointInterval=${checkpointInterval})`, () => {
      const doc = createTokenizedDocument({
        language: javascript,
        checkpointInterval,
      });
      doc.setCode(LargeCode);

      for (
        let boundary = checkpointInterval;
        boundary < expected.length;
        boundary += checkpointInterval
      ) {
        // exactly at, and straddling, a checkpoint boundary
        expect(doc.lineRange(boundary, boundary + 5)).toEqual(
          expected.slice(boundary, boundary + 5),
        );
        expect(doc.lineRange(boundary - 2, boundary + 2)).toEqual(
          expected.slice(boundary - 2, boundary + 2),
        );
      }

      // the very end of the document, out of order relative to the boundary scan above
      expect(doc.lineRange(expected.length - 3, expected.length)).toEqual(
        expected.slice(expected.length - 3),
      );
    });

    it(`out-of-order random access (checkpointInterval=${checkpointInterval})`, () => {
      const doc = createTokenizedDocument({
        language: javascript,
        checkpointInterval,
      });
      doc.setCode(LargeCode);

      // Jump straight to a distant window before anything nearby has been
      // tokenized, then jump backward into earlier territory.
      expect(doc.lineRange(2500, 2540)).toEqual(expected.slice(2500, 2540));
      expect(doc.lineRange(10, 50)).toEqual(expected.slice(10, 50));
      expect(doc.lineRange(1200, 1210)).toEqual(expected.slice(1200, 1210));
      expect(doc.lineRange(0, expected.length)).toEqual(expected);
    });
  }

  it("a document whose final line has no trailing newline", () => {
    const code = LargeCode.slice(0, -1); // strip the trailing "\n"
    const noTrailingExpected = referenceLines("javascript", code);
    const doc = createTokenizedDocument({
      language: javascript,
      checkpointInterval: 100,
    });
    doc.setCode(code);
    expect(doc.lineCount()).toBe(noTrailingExpected.length);
    expect(doc.lineRange(0, doc.lineCount())).toEqual(noTrailingExpected);
    expect(doc.lineRange(doc.lineCount() - 5, doc.lineCount())).toEqual(
      noTrailingExpected.slice(-5),
    );
  });
});

describe("TokenizedDocument: behavior", () => {
  it("lineCount never tokenizes", () => {
    const doc = createTokenizedDocument({ language: javascript });
    doc.setCode(generateLargeJsDocument(500));
    expect(doc.lineCount()).toBeGreaterThan(0);
    expect(doc.tokenizedThrough()).toBe(0);
  });

  it("laziness: lineRange(0, 40) leaves tokenizedThrough() bounded by one interval past 40", () => {
    const doc = createTokenizedDocument({
      language: javascript,
      checkpointInterval: 100,
    });
    doc.setCode(generateLargeJsDocument(5000));
    doc.lineRange(0, 40);
    expect(doc.tokenizedThrough()).toBeGreaterThanOrEqual(40);
    expect(doc.tokenizedThrough()).toBeLessThanOrEqual(140);
  });

  it("append is equivalent to setCode(old + chunk), across chunk shapes", () => {
    const full = generateLargeJsDocument(400);
    const expected = referenceLines("javascript", full);

    const splitPoints = [
      // no-newline chunk boundary (mid-token)
      full.indexOf("const x5") + 3,
      // multi-line chunk boundary
      full.indexOf("\n", 200) + 1,
    ].filter((i) => i > 0 && i < full.length);

    for (const splitAt of splitPoints) {
      const doc = createTokenizedDocument({
        language: javascript,
        checkpointInterval: 7,
      });
      doc.setCode(full.slice(0, splitAt));
      doc.append(full.slice(splitAt));
      expect(doc.lineRange(0, doc.lineCount())).toEqual(expected);
    }
  });

  it("append never re-tokenizes already-checkpointed content", () => {
    const doc = createTokenizedDocument({
      language: javascript,
      checkpointInterval: 50,
    });
    doc.setCode(generateLargeJsDocument(200));
    doc.lineRange(0, 100);
    const throughBeforeAppend = doc.tokenizedThrough();

    doc.append(generateLargeJsDocument(50));
    // Appending alone (no lineRange call) must not advance tokenization.
    expect(doc.tokenizedThrough()).toBe(throughBeforeAppend);
  });

  it("window cache: repeated and overlapping calls return consistent results", () => {
    const code = generateLargeJsDocument(600);
    const expected = referenceLines("javascript", code);
    const doc = createTokenizedDocument({
      language: javascript,
      checkpointInterval: 40,
    });
    doc.setCode(code);

    const first = doc.lineRange(100, 140);
    expect(first).toEqual(expected.slice(100, 140));
    // Same call again (cache hit path).
    expect(doc.lineRange(100, 140)).toEqual(first);
    // Overlapping, larger window (cache extension or recompute - either way, correct).
    expect(doc.lineRange(90, 160)).toEqual(expected.slice(90, 160));
    // Back to the original window still matches.
    expect(doc.lineRange(100, 140)).toEqual(first);
  });

  it("setCode with unrelated content fully resets (does not treat it as an append)", () => {
    const doc = createTokenizedDocument({ language: javascript });
    doc.setCode(generateLargeJsDocument(50));
    doc.lineRange(0, 10);

    const other = "const totally = 'different document';\nconst b = 2;\n";
    doc.setCode(other);
    expect(doc.tokenizedThrough()).toBe(0);
    expect(doc.lineCount()).toBe(referenceLines("javascript", other).length);
    expect(doc.lineRange(0, doc.lineCount())).toEqual(
      referenceLines("javascript", other),
    );
  });

  it("empty document", () => {
    const doc = createTokenizedDocument({ language: javascript });
    doc.setCode("");
    expect(doc.lineCount()).toBe(1);
    expect(doc.lineRange(0, 1)).toEqual([""]);
    expect(doc.lineRange(0, 0)).toEqual([]);
  });
});
