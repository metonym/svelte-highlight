# tests/e2e/static-app

Multi-entry Vite 8 + Svelte 5 app for `svelte-highlight/static`. Each folder under `entries/` is a tiny app with one scenario, built with real `vite build` against the packaged output in `../../../package`, not the monorepo `src/`.

Layout follows [carbon-preprocess-svelte's `examples/vite@svelte-5`](https://github.com/carbon-design-system/carbon-preprocess-svelte/tree/main/examples/vite%40svelte-5): one `vite.config.ts` reads `ENTRY` for `root`/`outDir`, `entries.manifest.json` lists entries, and `scripts/build-all-entries.ts` builds and verifies them in order.

`tests/static-preprocessor.test.ts` calls `preprocess()` directly. These builds go through `@sveltejs/vite-plugin-svelte` and Vite 8. `verify.ts` checks that `highlight.js` never lands in the bundle.

## Entries

| Entry | Scenario |
| --- | --- |
| `single-snippet-injected-style` | One static `<Highlight>`; theme via `svelte:head` injected style |
| `single-snippet-stylesheet` | One static `<Highlight>`; theme via `svelte-highlight/styles/atom-one-dark.css` import |
| `multiple-snippets-same-language` | Three static `<Highlight>` usages, same language |
| `multiple-snippets-various-languages` | Three static usages: javascript, typescript, css |
| `scoped-styles-multiple-themes` | Two static usages, each in a different `HighlightStyle` theme |

## Layout

```
entries/<name>/
  index.html
  App.svelte
entries.manifest.json   # list for build-all-entries.ts and verify.ts
vite.config.ts          # root = entries/<ENTRY>, outDir = dist/<ENTRY>
verify.ts               # per-entry assertions, run with `node verify.ts <entry>`
scripts/
  ensure-ready.ts       # builds ../../../package if missing (see below)
  build-all-entries.ts  # builds + verifies every entry in entries.manifest.json
dist/<name>/            # per-entry build output (gitignored)
```

## Running

The app depends on `"svelte-highlight": "file:../../../package"`. `bun install` fails if that folder doesn't exist yet, because `file:` deps resolve before any lifecycle script runs.

`dev`, `build`, and `test` all run `scripts/ensure-ready.ts` first (`predev`/`prebuild`/`pretest`). It builds `../../../package` (`bun run build:lib && bun run package`) and runs `bun install` here when needed. From this directory:

```bash
bun run test
```

works on a fresh checkout with no manual root step. The guard only runs when something is missing, so repeat runs stay fast. After you edit `src/preprocessor.js` or anything else in the root package, delete `../../../package` so the guard rebuilds it, or run from the repo root for an always-fresh build:

```bash
bun run test:static-app
```

`bun run test` and `bun run build` both call `scripts/build-all-entries.ts`, which loops `entries.manifest.json`, runs `ENTRY=<name> vite build`, then `node verify.ts <name>`. Single entry:

```bash
bun run dev:scoped-styles-multiple-themes
bun run build:multiple-snippets-various-languages
node verify.ts multiple-snippets-various-languages
```

`verify.ts` checks static markup and theme CSS in the output, and that `highlight.js` core is absent (via minification-resistant internal strings).
