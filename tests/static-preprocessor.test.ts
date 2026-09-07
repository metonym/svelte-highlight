import { compile, preprocess } from "svelte/compiler";
import { highlightStatic } from "../src/static.js";

const filename = "tests/fixture.svelte";

/** @param {string} source */
async function transform(source: string) {
  const result = await preprocess(source, highlightStatic(), { filename });
  return result.code;
}

describe("highlightStatic", () => {
  it("replaces a literal code + imported language usage with static hljs markup", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<Highlight language={javascript} code="const x = 1;" />
`;
    const output = await transform(source);

    expect(output).not.toContain("<Highlight");
    expect(output).toContain('<pre class="hljs" data-language="javascript"');
    expect(output).toContain('<code class="hljs">');
    expect(output).toContain("hljs-keyword");
    // Runtime imports are left in place; tree-shaking is left to the consumer's bundler.
    expect(output).toContain('import Highlight from "../src/Highlight.svelte"');
  });

  it("leaves dynamic code untouched", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
  let code = "const x = 1;";
</script>

<Highlight language={javascript} {code} />
`;
    const output = await transform(source);
    expect(output).toBe(source);
  });

  it("leaves dynamic language untouched", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";

  function getLanguage() {}
</script>

<Highlight language={getLanguage()} code="const x = 1;" />
`;
    const output = await transform(source);
    expect(output).toBe(source);
  });

  it("leaves usages with default slot content untouched", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<Highlight language={javascript} code="const x = 1;">
  custom
</Highlight>
`;
    const output = await transform(source);
    expect(output).toBe(source);
  });

  it("transforms a bare langtag into a position:relative pre plus an inline badge span", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<Highlight language={javascript} code="const x = 1;" langtag />
`;
    const output = await transform(source);

    expect(output).not.toContain("<Highlight");
    expect(output).toContain("position:relative;");
    expect(output).toContain(
      '<span style="position:absolute;top:var(--langtag-top, 0);',
    );
    expect(output).toContain(">javascript</span>");
  });

  it("transforms langtag={false} without the badge span", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<Highlight language={javascript} code="const x = 1;" langtag={false} />
`;
    const output = await transform(source);

    expect(output).not.toContain("<Highlight");
    expect(output).not.toContain("position:relative;");
    expect(output).not.toContain("position:absolute;top:var(--langtag-top");
  });

  it("leaves usages with a non-literal langtag untouched", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
  let showLangtag = true;
</script>

<Highlight language={javascript} code="const x = 1;" langtag={showLangtag} />
`;
    const output = await transform(source);
    expect(output).toBe(source);
  });

  it("leaves untouched when a local component is merely named Highlight", async () => {
    const source = `<script>
  import Highlight from "./MyOwnComponent.svelte";
  import javascript from "../src/languages/javascript.js";
</script>

<Highlight language={javascript} code="const x = 1;" />
`;
    const output = await transform(source);
    expect(output).toBe(source);
  });

  it("only transforms the eligible usage when multiple Highlight elements are present", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
  let code = "const x = 1;";
</script>

<Highlight language={javascript} code="const eligible = 1;" />
<Highlight language={javascript} {code} />
`;
    const output = await transform(source);

    expect(output).toContain('data-language="javascript"');
    expect(output).toContain("<Highlight language={javascript} {code} />");
    expect(output.match(/<Highlight/g)).toHaveLength(1);
  });

  it("escapes literal braces in the highlighted output so the compiler doesn't parse them as expressions", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import css from "../src/languages/css.js";
</script>

<Highlight language={css} code={".a { color: red; }"} />
`;
    const output = await transform(source);

    expect(output).not.toContain("<Highlight");
    expect(output).toContain("{'{'}");
    expect(output).toContain("{'}'}");
    // The real regression check: unescaped braces would make the compiler throw a
    // js_parse_error when it re-parses the preprocessed markup.
    expect(() => compile(output, { filename })).not.toThrow();
  });

  it("falls back and reports via onWarn when an eligible usage's language module can't be resolved", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import doesNotExist from "svelte-highlight/languages/does-not-exist";
</script>

<Highlight language={doesNotExist} code="const x = 1;" />
`;
    const warnings: Array<{ message: string; details: unknown }> = [];
    const result = await preprocess(
      source,
      highlightStatic({
        onWarn: (message, details) => warnings.push({ message, details }),
      }),
      { filename },
    );

    expect(result.code).toBe(source);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.message).toContain(
      'could not resolve language module "svelte-highlight/languages/does-not-exist"',
    );
    expect(warnings[0]?.details).toMatchObject({ filename, line: 6 });
  });

  it("defaults to console.warn without throwing when onWarn is not provided", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import doesNotExist from "svelte-highlight/languages/does-not-exist";
</script>

<Highlight language={doesNotExist} code="const x = 1;" />
`;
    const originalWarn = console.warn;
    const calls: unknown[][] = [];
    console.warn = (...args: unknown[]) => calls.push(args);

    try {
      const output = await transform(source);
      expect(output).toBe(source);
      expect(calls).toHaveLength(1);
      expect(String(calls[0]?.[0])).toContain("[svelte-highlight/static]");
    } finally {
      console.warn = originalWarn;
    }
  });

  it("fires onSummary once per file with counts for eligible and matched-but-failing usages", async () => {
    const source = `<script>
  import Highlight from "../src/Highlight.svelte";
  import javascript from "../src/languages/javascript.js";
  import doesNotExist from "svelte-highlight/languages/does-not-exist";
</script>

<Highlight language={javascript} code="const x = 1;" />
<Highlight language={doesNotExist} code="const y = 2;" />
`;
    const summaries: Array<{
      filename?: string;
      matched: number;
      succeeded: number;
      failed: number;
    }> = [];

    await preprocess(
      source,
      highlightStatic({
        onWarn: () => {},
        onSummary: (summary) => summaries.push(summary),
      }),
      { filename },
    );

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toEqual({
      filename,
      matched: 2,
      succeeded: 1,
      failed: 1,
    });
  });

  it("does not fire onSummary for a file with no <Highlight> usages", async () => {
    const source = `<script>
  const x = 1;
</script>

<p>{x}</p>
`;
    const summaries: unknown[] = [];

    await preprocess(
      source,
      highlightStatic({ onSummary: (summary) => summaries.push(summary) }),
      { filename },
    );

    expect(summaries).toHaveLength(0);
  });
});
