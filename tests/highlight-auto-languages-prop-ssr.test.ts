/**
 * `HighlightAuto`'s `languages` prop path: unlike the default path (see
 * `tests/highlight-events-ssr.test.ts`), it's synchronous everywhere,
 * including SSR, over the bounded pool the caller passes in - the escape
 * hatch that restores the old always-synchronous behavior with a
 * deterministic bundle.
 *
 * Kept in its own file (a fresh, empty shared registry singleton) rather
 * than folded into highlight-events-ssr.test.ts's shared describe block:
 * that file's tests share the module-singleton registry from
 * `src/registry.js` across sequential renders in one process, and this
 * suite's `python` registration has no reason to interact with that file's
 * svelte/typescript-focused assertions.
 */
import fs from "node:fs";
import path from "node:path";
import { plugin } from "bun";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import { createRegistry, registerAll } from "../src/engine.js";
import python from "../src/languages/python.js";
import typescript from "../src/languages/typescript.js";

plugin({
  name: "svelte-server-compile",
  setup(build) {
    build.onLoad({ filter: /\.svelte$/ }, ({ path: filePath }) => {
      const source = fs.readFileSync(filePath, "utf-8");
      const { js } = compile(source, {
        generate: "server",
        filename: path.basename(filePath),
      });
      return { contents: js.code, loader: "js" };
    });
  },
});

const srcDir = path.join(import.meta.dir, "../src");

const registry = createRegistry();
registerAll(registry, typescript);
registerAll(registry, python);

async function importWrapper(name: string, source: string) {
  const wrapperPath = path.join(srcDir, `.tmp-${name}.svelte`);
  fs.writeFileSync(wrapperPath, source);
  try {
    return await import(wrapperPath);
  } finally {
    fs.unlinkSync(wrapperPath);
  }
}

describe("HighlightAuto `languages` prop: synchronous, SSR-highlighted output", () => {
  it("SSR-renders the winning language's real highlighted HTML, not plain text", async () => {
    const { default: Wrapper } = await importWrapper(
      "highlight-auto-languages-prop",
      `<script>
  import HighlightAuto from "./HighlightAuto.svelte";
  import typescript from "./languages/typescript.js";
  import python from "./languages/python.js";
  export let code;
</script>
<HighlightAuto {code} languages={[typescript, python]} let:highlighted let:languageName>
  <span data-language={languageName}>{@html highlighted}</span>
</HighlightAuto>
`,
    );

    const code = "def greet(name):\n    return f'hello {name}'\n";
    const { body } = render(Wrapper, { props: { code } });

    const detected = registry.highlightAuto(code, ["typescript", "python"]);
    expect(detected.language).toBe("python");
    const expected = registry.highlight(code, { language: "python" });

    expect(body).toContain('data-language="python"');
    expect(body).toContain(expected.value);
  });

  it("`languageNames` further filters the `languages` pool", async () => {
    const { default: Wrapper } = await importWrapper(
      "highlight-auto-languages-prop-filtered",
      `<script>
  import HighlightAuto from "./HighlightAuto.svelte";
  import typescript from "./languages/typescript.js";
  import python from "./languages/python.js";
  export let code;
</script>
<HighlightAuto {code} languages={[typescript, python]} languageNames={["typescript"]} let:languageName>
  <span data-language={languageName} />
</HighlightAuto>
`,
    );

    // Python-idiomatic code, but restricted to just "typescript" - should
    // never detect as python even though it's a much better match.
    const code = "def greet(name):\n    return f'hello {name}'\n";
    const { body } = render(Wrapper, { props: { code } });

    expect(body).toContain('data-language="typescript"');
  });
});
