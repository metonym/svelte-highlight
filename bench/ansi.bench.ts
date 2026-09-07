/**
 * ansi.js's parseAnsi() and ansi-color.js's per-segment class/style
 * computation - the two passes AnsiOutput.svelte's reactive `$: segments =
 * parsed.map(...)` runs on every `text` change. No prior baseline exists
 * for the color-math half: it used to live inline in the component's
 * `<script>`, which isn't reachable from bench/ or tests/ at all.
 */
import { group, task } from "ostia";
import { createAnsiSession, parseAnsi } from "../src/ansi.js";
import { classNames, inlineStyle } from "../src/ansi-color.js";

const FG_CODES = [
  "\x1b[31m",
  "\x1b[32m",
  "\x1b[38;5;208m",
  "\x1b[38;2;10;20;30m",
];
const BG_CODES = ["", "\x1b[41m", "\x1b[48;5;22m", "\x1b[48;2;200;210;220m"];
const STYLE_CODES = ["", "\x1b[1m", "\x1b[3m", "\x1b[4m", "\x1b[9m"];

/** Synthetic colored terminal output: one styled "word" per segment. */
function ansiSource(segmentCount: number) {
  let out = "";
  for (let i = 0; i < segmentCount; i++) {
    out += FG_CODES[i % FG_CODES.length];
    out += BG_CODES[i % BG_CODES.length];
    out += STYLE_CODES[i % STYLE_CODES.length];
    out += `word${i} `;
    out += "\x1b[0m";
  }
  return out;
}

const SEGMENT_COUNTS = [200, 2_000, 20_000];

group("parseAnsi()", () => {
  for (const count of SEGMENT_COUNTS) {
    const source = ansiSource(count);
    task(`${count.toLocaleString()} segments`, () => parseAnsi(source));
  }
});

group("classNames() + inlineStyle() over parsed segments", () => {
  for (const count of SEGMENT_COUNTS) {
    const segments = parseAnsi(ansiSource(count));
    for (const autoContrast of [true, false]) {
      task(
        `${count.toLocaleString()} segments, autoContrast=${autoContrast}`,
        () => {
          const results: unknown[] = [];
          for (const segment of segments) {
            results.push(classNames(segment));
            results.push(inlineStyle(segment, autoContrast));
          }
          return results;
        },
      );
    }
  }
});

// Fixed chunk size for the repeated-append case below: small enough to
// straddle SGR/OSC 8 sequences many times over a long corpus.
const CHUNK_BYTES = 200;

/** Split `source` into fixed-size chunks (the last one may be shorter). */
function chunk(source: string, size: number) {
  const chunks: string[] = [];
  for (let i = 0; i < source.length; i += size) {
    chunks.push(source.slice(i, i + size));
  }
  return chunks;
}

group("repeated append: createAnsiSession vs re-parsing on every chunk", () => {
  for (const count of SEGMENT_COUNTS) {
    const chunks = chunk(ansiSource(count), CHUNK_BYTES);

    task(`${count.toLocaleString()} segments, createAnsiSession`, () => {
      const session = createAnsiSession();
      let latest: unknown;
      for (const piece of chunks) {
        session.append(piece);
        latest = session.segments();
      }
      return latest;
    });

    task(`${count.toLocaleString()} segments, parseAnsi on every chunk`, () => {
      let accumulated = "";
      let latest: unknown;
      for (const piece of chunks) {
        accumulated += piece;
        latest = parseAnsi(accumulated);
      }
      return latest;
    });
  }
});

// Run this suite with `ostia bench bench/ansi.bench.ts` for a fast feedback
// loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
