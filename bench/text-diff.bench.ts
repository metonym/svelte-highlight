/**
 * text-diff.js: diffText's common-prefix/suffix scan, the primitive
 * reparseIncremental uses to locate the resume point on every edit. Its
 * cost is O(shared prefix/suffix length), so the interesting axis isn't
 * document size alone but *how much of the document the scan has to walk
 * before finding a difference*.
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
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
  summary(() => {
    for (const [name, after] of Object.entries(cases)) {
      bench(name, () => {
        do_not_optimize(diffText(base, after));
      });
    }
  });
});

// Run this suite alone with `bun bench/text-diff.bench.ts` for a fast
// feedback loop; bench/index.ts imports every suite for a full-baseline run.
if (import.meta.main) await run();
