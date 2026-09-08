# Contributing

## Adding a custom language

svelte-highlight ships two distinct ways to get a grammar highlighted, and it's easy to confuse them:

- **Consumer-facing:** [`fromHighlightJs`](README.md#custom-language) in `svelte-highlight/compat` — a runtime converter an *app* calls to highlight a language this package doesn't ship. Not what this document is about.
- **Contributor-facing (this document):** a grammar baked into the package itself, shipped as `svelte-highlight/languages/<name>` and demoed on the docs site. This is the pipeline below.

A bundled custom grammar touches 8 files across `scripts/`, `tests/`, and `www/`. `bun scripts/add-language.ts <name> "<Display Name>"` scaffolds all of them — see [Using the scaffold script](#using-the-scaffold-script) below — but you still need to author the grammar itself, its differential-corpus sample, its test assertions, and its preview snippets by hand.

### The pipeline

1. Write `scripts/custom-languages/<name>.js`: a plain hljs-mode module —

   ```js
   function define<Name>(hljs) {
     return { name: "<name>", /* keywords, contains, aliases, case_insensitive */ };
   }

   /** @type {import("highlight.js").LanguageFn} */
   function register(hljs) {
     return define<Name>(hljs);
   }

   export const <name> = { name: "<name>", register };
   export default <name>;
   ```

   Look at an existing grammar for the shape you need: `csv.js` for a keyword-less, `contains`-only grammar; `renpy.js` or `zig.js` for a keyword-heavy one. **Not automated — author this by hand.**
2. Append `"<name>",` to `CUSTOM_LANGUAGE_NAMES` in `scripts/build-languages.ts` (before the closing `] as const;`). *Automated by the scaffold.*
3. Add a `<name>: \`...\`` entry to `CUSTOM_SNIPPETS` in `tests/differential-corpus.ts` — a short, multi-construct sample (keywords/punctuation, at least one nested or structural construct). This feeds `tests/differential.test.ts`, which highlights it with both real `highlight.js` (via the grammar's own `register(hljs)`) and this repo's converted engine and asserts byte-identical output. **Not automated — the scaffold writes a `// TODO` placeholder; replace it with a real sample.**
4. Bump `tests/languages.test.ts`'s `expect(languageNames.length).toEqual(<N>)` by however many languages you added. *Automated by the scaffold.*
5. Run `bun run build:lib` — regenerates `src/languages/<name>.js`, `SUPPORTED_LANGUAGES.md`, the alias table, and `www/data/languages.json`. These are gitignored build output; never hand-edit them.
6. Add `tests/<name>-language.test.ts`: `createRegistry()` from `../src/engine.js`, `registry.register(<name>.register)`, then 4-6 `test(...)` assertions on `registry.highlight(code, { language: "<name>" }).value` containing expected `<span class="hljs-...">` fragments (follow `tests/renpy-language.test.ts`'s shape). **Not automated — the scaffold writes a placeholder test; write real assertions.**
7. Update the two auto-generated snapshots by running the tests with `-u`: `bun test tests/languages.test.ts tests/languages-golden.test.ts --update-snapshots` (the golden test iterates every registered language automatically — a keyword-bearing grammar just needs to produce at least one `hljs-` span on a sample built from its own keyword table; no per-language entry required unless the grammar's keyword-bearing modes are gated behind a structural anchor, in which case add a prefix to `SAMPLE_PREFIXES` in `tests/languages-golden.test.ts`).
8. Add `www/preview/<name>-preview-snippets.ts` (type `<Name>PreviewSnippet[]`, ≥3 entries, each `{ title, description?, code }` — follow `www/preview/csv-preview-snippets.ts`'s shape). *Scaffolded as an empty array with a `// TODO`; you still need to author real snippets.*
9. Add `www/pages/preview-<name>.astro`:

   ```astro
   ---
   import LanguagePreview from "@components/LanguagePreview.svelte";
   import Layout from "@layouts/Layout.astro";
   ---

   <Layout title="<Display Name> language preview">
     <LanguagePreview language="<name>" client:idle />
   </Layout>
   ```

   *Automated by the scaffold.*
10. Wire `www/components/LanguagePreview.svelte`: an `import <name> from "svelte-highlight/languages/<name>";` (alphabetical among the existing `svelte-highlight/languages/*` imports), an `import { <name>PreviewSnippets } from "@www/preview/<name>-preview-snippets";` (alphabetical among the `@www/preview/*` imports), and a `<name>: { lang: <name>, snippets: <name>PreviewSnippets },` entry appended to the `registry` object (that object is populated in the chronological order languages were added, not alphabetically — append at the end). *Automated by the scaffold.*
11. Add `"/preview-<name>": "<Display Name> language preview"` to `hiddenRoutes` in `www/components/globals/Header.svelte` (appended near the other language entries). *Automated by the scaffold.*

Steps 1/2/6/8/9/10/11 are stubbed out by the scaffold script (some as working code — 2, 9, 10, 11 — some as `// TODO` placeholders you fill in — 1, 6, 8). Steps 3, 4, 5, and 7 either need hand-authored content or are commands you run yourself.

Split the work into two commits, matching how every language pair in this repo's history has landed: a `feat(languages): …` commit covering steps 1-7 (grammar, registration, differential snippet, count bump, build output, language test, updated snapshots), and a `docs(languages): …` commit covering steps 8-11 (preview snippets, preview page, `LanguagePreview.svelte` wiring, `hiddenRoutes`).

### Using the scaffold script

```sh
bun scripts/add-language.ts <name> "<Display Name>"
```

`<name>` must be lowercase `[a-z][a-z0-9-]*` and must not already exist. The script writes the 5 new files (grammar stub, language test stub, preview-snippets stub, preview page) and edits the 4 existing ones (`build-languages.ts`, `differential-corpus.ts`, `languages.test.ts`, `LanguagePreview.svelte`, `Header.svelte`) described above, then prints a summary and the exact follow-up commands to run once you've filled in the grammar.

### Quality bar

Before opening a PR for a new language, check:

- **Aliases.** Does the language have real hljs-style file-extension or name aliases (like CSV's `tsv`)? Add them to the grammar's `aliases` field if so.
- **`disableAutodetect`.** Make an explicit decision, don't leave the default unexamined. Default is `false`. Set it to `true` when the grammar's syntax is generic enough to plausibly false-positive during auto-detection — e.g. a bare URL or a semver range has almost no syntax that couldn't also appear as a fragment of an unrelated language, or embedded inside a wholly different document. Most grammars with real keywords or a distinctive structural anchor don't need this.
- **Relevance sanity check.** Only matters when `disableAutodetect` is `false`. Run `registry.highlight()` on the new grammar's differential-corpus sample under 3-5 syntactically similar existing language names and confirm none of them produce a plausible-looking result — i.e. the new grammar isn't going to get misdetected as, or steal detection from, a neighbor.
- **Snapshot corpus.** The ≥3 preview snippets must be real-world examples (an actual API endpoint, an actual config block, an actual template), not synthetic keyword soup that happens to hit every branch of the grammar.

### Commands

```sh
bun run build:lib
bun test tests/languages.test.ts tests/languages-golden.test.ts tests/<name>-language.test.ts --update-snapshots
bun run test:types
bun fix:changed
```
