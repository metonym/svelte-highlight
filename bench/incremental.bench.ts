/** parseIncremental/reparseIncremental, plus typing simulations vs naive full re-parse. */
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

group("reparseIncremental() one-character mid-document edit", () => {
  for (const lines of [2_000, 8_000]) {
    const base = parseIncremental(registry, "javascript", jsLines(lines));
    const at = base.code.indexOf("\n", base.code.length >> 1) + 1;
    const edited = `${base.code.slice(0, at)}x${base.code.slice(at)}`;
    task(`${lines.toLocaleString()}-line doc`, () =>
      reparseIncremental(registry, "javascript", base, edited),
    );
  }
});

group("reparseIncremental() edit that never re-converges", () => {
  for (const lines of [2_000, 8_000]) {
    const base = parseIncremental(registry, "javascript", jsLines(lines));
    const edited = `/* ${base.code}`;
    task(`${lines.toLocaleString()}-line doc, comment opened at top`, () =>
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
