/**
 * `Highlight`, `HighlightAuto`, and `HighlightSvelte` all expose the
 * scope-event stream as a default-slot prop (`events`) alongside the
 * existing `highlighted`/`langtag`/`languageName`. Slot content renders
 * synchronously during SSR, so this asserts the slot prop's contents match
 * the registry's own `events` for the same input - independent of the
 * `on:highlight` event detail, which is dispatched from `afterUpdate` and so
 * only fires client-side (covered instead by tests/e2e/*.events.test.svelte).
 *
 * Follows the `tests/highlight-non-string-code.test.ts` compile pattern: a
 * Bun plugin server-compiles every `.svelte` file on load (not just the
 * entrypoint), because Highlight/HighlightAuto/HighlightSvelte all
 * transitively import LangTag.svelte.
 */
import fs from "node:fs";
import path from "node:path";
import { plugin } from "bun";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import { createRegistry, registerAll } from "../src/engine.js";
import allLanguages from "../src/languages/all.js";
import svelteLanguage from "../src/languages/svelte.js";
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

/** Independent registry mirroring what the shared components register onto. */
const registry = createRegistry();
registerAll(registry, typescript);
registerAll(registry, svelteLanguage);
for (const language of allLanguages) registerAll(registry, language);

/**
 * Writes a temp `.svelte` wrapper alongside the real components (so its
 * relative import resolves), imports it, and deletes it afterward.
 */
async function importWrapper(name: string, source: string) {
  const wrapperPath = path.join(srcDir, `.tmp-${name}.svelte`);
  fs.writeFileSync(wrapperPath, source);
  try {
    return await import(wrapperPath);
  } finally {
    fs.unlinkSync(wrapperPath);
  }
}

describe("slot `events` matches the registry's events", () => {
  it("Highlight", async () => {
    const { default: Wrapper } = await importWrapper(
      "highlight-events",
      `<script>
  import Highlight from "./Highlight.svelte";
  export let language;
  export let code;
</script>
<Highlight {language} {code} let:events>{@html JSON.stringify(events)}</Highlight>
`,
    );

    const code = "const add = (a, b) => a + b;";
    const { body } = render(Wrapper, { props: { language: typescript, code } });
    const expected = registry.highlight(code, {
      language: "typescript",
    }).events;

    expect(body).toContain(JSON.stringify(expected));
  });

  it("HighlightAuto", async () => {
    const { default: Wrapper } = await importWrapper(
      "highlight-auto-events",
      `<script>
  import HighlightAuto from "./HighlightAuto.svelte";
  export let code;
</script>
<HighlightAuto {code} let:events>{@html JSON.stringify(events)}</HighlightAuto>
`,
    );

    const code = "const add = (a, b) => a + b;";
    const { body } = render(Wrapper, { props: { code } });
    const detected = registry.highlightAuto(code);
    const expected = registry.highlight(code, {
      language: detected.language as string,
    }).events;

    expect(body).toContain(JSON.stringify(expected));
  });

  it("HighlightSvelte", async () => {
    const { default: Wrapper } = await importWrapper(
      "highlight-svelte-events",
      `<script>
  import HighlightSvelte from "./HighlightSvelte.svelte";
  export let code;
</script>
<HighlightSvelte {code} let:events>{@html JSON.stringify(events)}</HighlightSvelte>
`,
    );

    const code =
      "<script>\n  let count = 0;\n<\\/script>\n<button>{count}</button>\n";
    const { body } = render(Wrapper, { props: { code } });
    const expected = registry.highlight(code, { language: "svelte" }).events;

    expect(body).toContain(JSON.stringify(expected));
  });
});
