/**
 * ansi.js's parseAnsi() and ansi-color.js's per-segment class/style
 * computation - the two passes AnsiOutput.svelte's reactive `$: segments =
 * parsed.map(...)` runs on every `text` change. No prior baseline exists
 * for the color-math half: it used to live inline in the component's
 * `<script>`, which isn't reachable from bench/ or tests/ at all.
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
import { parseAnsi } from "../src/ansi.js";
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
  summary(() => {
    for (const count of SEGMENT_COUNTS) {
      const source = ansiSource(count);
      bench(`${count.toLocaleString()} segments`, () => {
        do_not_optimize(parseAnsi(source));
      });
    }
  });
});

group("classNames() + inlineStyle() over parsed segments", () => {
  summary(() => {
    for (const count of SEGMENT_COUNTS) {
      const segments = parseAnsi(ansiSource(count));
      for (const autoContrast of [true, false]) {
        bench(
          `${count.toLocaleString()} segments, autoContrast=${autoContrast}`,
          () => {
            for (const segment of segments) {
              do_not_optimize(classNames(segment));
              do_not_optimize(inlineStyle(segment, autoContrast));
            }
          },
        );
      }
    }
  });
});

// Run this suite alone with `bun bench/ansi.bench.ts` for a fast feedback
// loop; bench/index.ts imports every suite for a full-baseline run.
if (import.meta.main) await run();
