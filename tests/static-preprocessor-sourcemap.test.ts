import { originalPositionFor, TraceMap } from "@jridgewell/trace-mapping";
import { highlightStatic } from "../src/static.js";

const filename = "tests/fixture.svelte";

/**
 * Calls the preprocessor's markup step directly, bypassing svelte/compiler's
 * `preprocess()`. `preprocess()` re-derives its own combined sourcemap and,
 * at least for a single markup step with no other preprocessors chained,
 * that combination collapses to empty `mappings` regardless of what we
 * return - true both before and after any change to this preprocessor. The
 * raw, pre-`preprocess()` map is what downstream tools (astro, vite) actually
 * consume when this preprocessor runs as part of a real chain, so that's
 * what needs to be correct.
 */
async function run(source: string) {
  const group = highlightStatic();
  if (!group.markup) throw new Error("expected a markup step");
  const result = await group.markup({ content: source, filename });
  if (!result || typeof result === "string" || Array.isArray(result)) {
    throw new Error("expected a transformed { code, map } result");
  }
  return result;
}

describe("highlightStatic sourcemap", () => {
  it("splices two sequential static matches without disturbing surrounding markup", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<p>before</p>
<Highlight language={javascript} code="const x = 1;" />
<p>middle</p>
<Highlight language={javascript} code="const y = 2;" />
<p>after</p>
`;

    const { code } = await run(source);

    expect(code.match(/<Highlight/g)).toBeNull();
    expect(code.match(/data-language="javascript"/g)).toHaveLength(2);
    expect(code).toContain("<p>before</p>");
    expect(code).toContain("<p>middle</p>");
    expect(code).toContain("<p>after</p>");
    // Order is preserved: "x" is highlighted before "y".
    expect(code.indexOf('hljs-number">1<')).toBeLessThan(
      code.indexOf('hljs-number">2<'),
    );
  });

  it("replaces a match at the very start of the file", async () => {
    const source = `<Highlight language={javascript} code="const x = 1;" />
<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>
`;
    const { code } = await run(source);
    expect(code.startsWith("<pre")).toBe(true);
  });

  it("replaces a match with nothing following it", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<Highlight language={javascript} code="const x = 1;" />`;
    const { code } = await run(source);
    expect(code.endsWith("</pre>")).toBe(true);
  });

  it("produces a well-formed, non-empty sourcemap", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<Highlight language={javascript} code="const x = 1;" />
`;
    const { map } = await run(source);
    const decoded = map as { sources: unknown; mappings: string };

    expect(map).toMatchObject({ version: 3 });
    expect(Array.isArray(decoded.sources)).toBe(true);
    expect(decoded.mappings.length).toBeGreaterThan(0);
  });

  it("maps unedited lines 1:1 and resyncs original line numbers after multi-line replacements", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<p>before</p>
<Highlight language={javascript} code="const x = 1;
const y = 2;" />
<p>middle</p>
<Highlight language={javascript} code="const a = 1;
const b = 2;
const c = 3;" />
<p>after</p>
`;

    const { code, map } = await run(source);
    const tracer = new TraceMap(
      map as ConstructorParameters<typeof TraceMap>[0],
    );
    const position = (line: number) =>
      originalPositionFor(tracer, { line, column: 0 });

    // Sanity: confirm the fixture's line numbers before asserting against them.
    const srcLines = source.split("\n");
    expect(srcLines[8]).toBe("<p>middle</p>");
    expect(srcLines[12]).toBe("<p>after</p>");
    expect(code.split("\n")[8]).toBe("<p>middle</p>");
    expect(code.split("\n")[12]).toBe("<p>after</p>");

    // Unedited preamble maps line-for-line to the original. (Line 5 is a
    // blank line - whether an empty line gets its own mapping segment is an
    // implementation detail with no observable effect, so it's skipped here.)
    for (const line of [1, 2, 3, 4, 6]) {
      expect(position(line)).toMatchObject({ line, column: 0 });
    }

    // Each replacement's first generated line anchors to its <Highlight> tag's
    // own start in the original source.
    expect(position(7)).toMatchObject({ line: 7, column: 0 });
    expect(position(10)).toMatchObject({ line: 10, column: 0 });

    // The line immediately after each replacement resumes at the correct
    // original line - the two source-vs-generated line counts here differ
    // (2 vs 2, then 3 vs 3) only by coincidence of the fixture; this is what
    // actually catches a line-count drift bug across a multi-line edit.
    expect(position(9)).toMatchObject({ line: 9, column: 0 });
    expect(position(13)).toMatchObject({ line: 13, column: 0 });
  });
});
