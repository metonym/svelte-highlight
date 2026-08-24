/**
 * highlightStatic()'s markup() step, end to end: parsing a .svelte file,
 * resolving each matched language module, running highlight.js, and
 * splicing the static HTML back in with a sourcemap. Scaling by match
 * count isolates the splice/sourcemap cost (the part this preprocessor
 * hand-rolls instead of using magic-string) from the fixed parse/resolve
 * overhead paid once per file regardless of match count.
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
import { highlightStatic } from "../src/static.js";

const filename = "bench/fixture.svelte";

function fixture(matchCount: number) {
  const header = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

`;
  const blocks: string[] = [];
  for (let i = 0; i < matchCount; i += 1) {
    blocks.push(
      `<p>section ${i}</p>`,
      `<Highlight language={javascript} code="function f${i}(a, b) {\nreturn a + b + ${i};\n}" />`,
    );
  }
  return `${header + blocks.join("\n")}\n`;
}

const MATCH_COUNTS = [1, 10, 50];

group("highlightStatic().markup()", () => {
  summary(() => {
    for (const matchCount of MATCH_COUNTS) {
      const source = fixture(matchCount);
      bench(`${matchCount} matches`, async () => {
        const group = highlightStatic();
        do_not_optimize(await group.markup?.({ content: source, filename }));
      });
    }
  });
});

// Run this suite alone with `bun bench/preprocessor.bench.ts` for a fast
// feedback loop; bench/index.ts imports every suite for a full-baseline run.
if (import.meta.main) await run();
