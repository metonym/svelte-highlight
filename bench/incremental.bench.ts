/**
 * incremental-tokenize.js: cold parseIncremental, single-edit
 * reparseIncremental, and a typing-simulation macro-benchmark comparing
 * incremental reparse against naive "re-parse the whole document on every
 * keystroke" - the thing incremental parsing exists to avoid. Sizes are
 * kept modest for the typing simulations since each sample re-runs the
 * full keystroke-by-keystroke loop (ostia's runner wants multiple samples
 * per case).
 */
import { group, task } from "ostia";
import {
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import { buildRegistry, jsLines, jsSource } from "./_shared.ts";

const registry = await buildRegistry();

group("parseIncremental() cold parse", () => {
  for (const lines of [500, 2_000, 8_000]) {
    const code = jsLines(lines);
    task(`${lines.toLocaleString()} lines`, () =>
      parseIncremental(registry, "javascript", code),
    );
  }
});

group("reparseIncremental() single append edit", () => {
  for (const lines of [500, 2_000, 8_000]) {
    const base = parseIncremental(registry, "javascript", jsLines(lines));
    const edited = `${base.code}function tail() {}\n`;
    task(`${lines.toLocaleString()}-line doc, +1 line`, () =>
      reparseIncremental(registry, "javascript", base, edited),
    );
  }
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
  for (const length of [800, 2_000]) {
    task(`incremental reparse @ ${length.toLocaleString()} chars typed`, () =>
      typeIncremental(length),
    );
    task(`naive full re-parse @ ${length.toLocaleString()} chars typed`, () =>
      typeNaive(length),
    );
  }
});

// Run this suite with `ostia bench bench/incremental.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
