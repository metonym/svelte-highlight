/**
 * incremental-tokenize.js: cold parseIncremental, single-edit
 * reparseIncremental, and a typing-simulation macro-benchmark comparing
 * incremental reparse against naive "re-parse the whole document on every
 * keystroke" - the thing incremental parsing exists to avoid. Sizes are
 * kept modest for the typing simulations since each sample re-runs the
 * full keystroke-by-keystroke loop (mitata wants 12+ samples per case).
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
import {
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import { buildRegistry, jsLines, jsSource } from "./_shared.ts";

const registry = await buildRegistry();

group("parseIncremental() cold parse", () => {
  summary(() => {
    for (const lines of [500, 2_000, 8_000]) {
      const code = jsLines(lines);
      bench(`${lines.toLocaleString()} lines`, () => {
        do_not_optimize(parseIncremental(registry, "javascript", code));
      });
    }
  });
});

group("reparseIncremental() single append edit", () => {
  summary(() => {
    for (const lines of [500, 2_000, 8_000]) {
      const base = parseIncremental(registry, "javascript", jsLines(lines));
      const edited = `${base.code}function tail() {}\n`;
      bench(`${lines.toLocaleString()}-line doc, +1 line`, () => {
        do_not_optimize(
          reparseIncremental(registry, "javascript", base, edited),
        );
      });
    }
  });
});

function typeIncremental(targetLength: number) {
  const source = jsSource(targetLength);
  let code = "";
  let state: ReturnType<typeof parseIncremental> | undefined;
  for (const ch of source) {
    code += ch;
    state = state
      ? reparseIncremental(registry, "javascript", state, code)
      : parseIncremental(registry, "javascript", code);
  }
  return state;
}

function typeNaive(targetLength: number) {
  const source = jsSource(targetLength);
  let code = "";
  let state: ReturnType<typeof parseIncremental> | undefined;
  for (const ch of source) {
    code += ch;
    state = parseIncremental(registry, "javascript", code);
  }
  return state;
}

group("typing simulation (keystroke-by-keystroke)", () => {
  summary(() => {
    for (const length of [800, 2_000]) {
      bench(
        `incremental reparse @ ${length.toLocaleString()} chars typed`,
        () => {
          do_not_optimize(typeIncremental(length));
        },
      );
      bench(
        `naive full re-parse @ ${length.toLocaleString()} chars typed`,
        () => {
          do_not_optimize(typeNaive(length));
        },
      );
    }
  });
});

// Run this suite alone with `bun bench/incremental.bench.ts` for a fast
// feedback loop; bench/index.ts imports every suite for a full-baseline run.
if (import.meta.main) await run();
