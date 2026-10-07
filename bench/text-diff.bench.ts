/** diffText(): cost scales with how much shared prefix/suffix the scan walks. */
import { group, task } from "ostia";
import { diffText } from "../src/text-diff.js";
import { jsSource } from "./_shared.ts";

const SIZE = 50_000;
const base = jsSource(SIZE);

const cases: Record<string, string> = {
  "append at end": `${base}// appended line\n`,
  "prepend at start": `// prepended line\n${base}`,
  "edit in the middle": `${base.slice(0, SIZE / 2)}/*edit*/${base.slice(SIZE / 2)}`,
  "no shared prefix or suffix": base.split("").reverse().join(""),
  "unicode surrogate pairs at the boundary": `${base}\u{1F600}\u{1F601}`,
};

group("diffText()", () => {
  for (const [name, after] of Object.entries(cases)) {
    task(name, () => diffText(base, after));
  }
});

// Small buffer, where per-call setup cost would show.
const SMALL = 1_000;
const small = jsSource(SMALL);
const smallCases: Record<string, string> = {
  "append at end": `${small}x`,
  "edit in the middle": `${small.slice(0, SMALL / 2)}x${small.slice(SMALL / 2)}`,
};

group(`diffText() @ ${SMALL.toLocaleString()} chars`, () => {
  for (const [name, after] of Object.entries(smallCases)) {
    task(name, () => diffText(small, after));
  }
});
