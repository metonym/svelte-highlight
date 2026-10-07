/** highlightStatic().markup(); scaling by match count isolates splice/sourcemap cost. */
import { group, task } from "ostia";
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
    // No `{`/`}` in `code`: Svelte would parse them as an expression and
    // markup() would bail out before matching.
    blocks.push(
      `<p>section ${i}</p>`,
      `<Highlight language={javascript} code="const sum${i} = a + b + ${i};\nconsole.log(sum${i});" />`,
    );
  }
  return `${header + blocks.join("\n")}\n`;
}

const MATCH_COUNTS = [1, 10, 50];

group("highlightStatic().markup()", () => {
  for (const matchCount of MATCH_COUNTS) {
    const source = fixture(matchCount);
    task(`${matchCount} matches`, async () => {
      const preprocessor = highlightStatic();
      return await preprocessor.markup?.({ content: source, filename });
    });
  }
});
