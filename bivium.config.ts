import type { Config } from "bivium";

// Types only, so `bivium plan` runs before an install: CI's plan job plans
// every PR without one.

// Runs the build scripts in order. `edges` gives each output its inputs.
const BUILD = ["scripts/index.ts"];

const GENERATED = "gitignored build output; @depends-on names its inputs";

export default {
  base: "origin/master",
  suites: {
    unit: {
      tests: "tests/*.test.ts",
      run: "bun test {files}",
      root: "tests",
      wiring: BUILD,
      // The e2e suite's files, and a page that imports `package/` for a
      // manual check.
      nonInputs: ["tests/e2e/**", "tests/SvelteHighlightPackage.test.svelte"],
      // `bun test` runs the code; `test:types` checks the types on its own.
      types: false,
    },
    e2e: {
      tests: "tests/e2e/*.test.ts",
      run: "bunx playwright test {files}",
      root: "tests/e2e",
      // The component-test page Playwright mounts every component into.
      wiring: [...BUILD, "playwright.config.ts", "tests/e2e/playwright/**"],
      // A standalone app with its own install, run by `test:static-app`,
      // which CI doesn't run.
      nonInputs: ["tests/e2e/static-app/**"],
      types: false,
    },
    // The perf budgets the unit job runs after the tests.
    perf: {
      tests: "scripts/benchmark-{engine,diff}.ts",
      run: "bun {files}",
      root: ["scripts/benchmark-engine.ts", "scripts/benchmark-diff.ts"],
      wiring: BUILD,
      types: false,
    },
  },
  // Tests import from `www/` and read the generated Markdown docs.
  roots: [
    "src",
    "tests",
    "scripts",
    "types",
    "bench",
    "www",
    "README.md",
    "SUPPORTED_LANGUAGES.md",
    "SUPPORTED_STYLES.md",
    "SUPPORTED_THEMES.md",
  ],
  ignore: ["CHANGELOG.md", "CONTRIBUTING.md", "examples/**"],
  // Playwright's Vite config aliases the package name to `src/`.
  alias: { "svelte-highlight": "src" },
  // `bun scripts/index.ts` (`build:lib`) writes these gitignored files.
  edges: {
    // Each grammar comes from its custom source or highlight.js (through the
    // build scripts' import of it), and embeds the grammars it imports. A
    // custom source imports the custom grammars it embeds, but an embedded
    // highlight.js grammar picks up its patch, so every grammar depends on
    // every patch.
    // `convert-grammars.ts` is in `reads` instead: it imports the first-pass
    // `index.js`, so as an edge it would make each grammar depend on all.
    "src/languages/*.js": [
      "scripts/build-languages.ts",
      "src/convert-language.js",
      "scripts/utils/write-to.ts",
      "scripts/custom-languages/$1.js",
      "scripts/hljs-patches/**",
    ],
    "src/languages/*.d.ts": "scripts/build-languages.ts",
    // Lists every grammar.
    "src/languages/{index,all,aliases}.{js,d.ts}": [
      "scripts/build-languages.ts",
      "scripts/convert-grammars.ts",
      "scripts/custom-languages/**",
      "scripts/hljs-patches/**",
    ],
    "src/languages/{loaders,detect-index}.{js,d.ts}": [
      "scripts/build-detect-index.ts",
      "scripts/convert-grammars.ts",
      "scripts/custom-languages/**",
      "scripts/hljs-patches/**",
    ],
    // Styles fill gaps from each other, so each depends on every source.
    "src/styles/**": ["scripts/build-styles.ts", "scripts/custom-styles/**"],
    "src/themes/**": [
      "scripts/build-styles.ts",
      "scripts/build-themes.ts",
      "scripts/custom-styles/**",
    ],
    "www/data/style-augmentations.json": [
      "scripts/build-styles.ts",
      "scripts/custom-styles/**",
    ],
    // `loadLanguage(name)` imports any generated grammar by name.
    "src/load-language.js": [
      "scripts/build-languages.ts",
      "scripts/convert-grammars.ts",
      "scripts/custom-languages/**",
      "scripts/hljs-patches/**",
    ],
  },
  reads: {
    "tests/*.test.ts": "tests/__snapshots__/$1.test.ts.snap",
    "src/languages/*.js": "scripts/convert-grammars.ts",
  },
  // `estree` is a types-only import from `@types/estree`; `playwright-core`
  // comes with `@playwright/test`.
  external: ["estree", "playwright-core"],
  self: ["bivium.config.ts"],
  // These tests read gitignored build output, which no diff can change.
  // Their `@depends-on` names the build's inputs.
  deadGlobs: [
    {
      file: "tests/supported-styles-docs.test.ts",
      glob: "src/styles/**",
      reason: GENERATED,
    },
    {
      file: "tests/theme-fidelity.test.ts",
      glob: "src/themes/**",
      reason: GENERATED,
    },
    {
      file: "tests/theme-fidelity.test.ts",
      glob: "src/styles/**",
      reason: GENERATED,
    },
    {
      file: "tests/theme-role-map-fidelity.test.ts",
      glob: "src/themes/**",
      reason: GENERATED,
    },
    {
      file: "tests/theme-style.test.ts",
      glob: "src/themes/**",
      reason: GENERATED,
    },
  ],
  // Fail on any new unknown node a test reaches.
  knownUnknowns: [],
  // Disk reads and dynamic imports that reach no repository file the graph
  // can't already see.
  hermetic: [
    // Compile `.svelte` files to a temp file and import it. Each names the
    // components it compiles with `@depends-on`.
    "tests/*-ssr.test.ts",
    "tests/_ssr.ts",
    "tests/highlight-non-string-code.test.ts",
    "tests/markdown-stream-updates.test.ts",
    "tests/stream-regenerate.test.ts",
    "tests/svelte-dom.ts",
    // Import generated grammars, styles and themes by name. Each names the
    // generator inputs with `@depends-on`.
    "tests/custom-styles.test.ts",
    "tests/differential.test.ts",
    "tests/theme-fidelity.test.ts",
    "tests/theme-role-map-fidelity.test.ts",
    "tests/worker.test.ts",
    // Imports the three modules it guards by path, named with `@depends-on`.
    "tests/perf-regression-guards.test.ts",
    // Imports a chunk URL in the browser.
    "tests/e2e/e2e.test.ts",
    // Imports any generated grammar, as `edges` declares.
    "src/load-language.js",
    // Imports the path its caller passes.
    "src/preprocessor.js",
    "scripts/utils/inline-css-urls.ts",
    // Temp directories and git.
    "tests/diff-git-roundtrip.test.ts",
    "tests/inline-css-urls.test.ts",
    // Reads `package/`, the gitignored output of `bun run package`.
    "tests/package-shape.test.ts",
    // The build scripts read every grammar and style. The `edges` above
    // give each output its own inputs, which is narrower than saying here
    // that every output depends on all of them.
    "scripts/build-*.ts",
    "scripts/convert-grammars.ts",
  ],
} satisfies Config;
