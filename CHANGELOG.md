# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.2.1](https://github.com/metonym/svelte-highlight/releases/tag/v7.2.1) - 2023-04-01

**Fixes**

- line numbers should not be covered by a solid fill, custom line background color
- line numbers column should not be covered by code if scrollable

## [7.2.0](https://github.com/metonym/svelte-highlight/releases/tag/v7.2.0) - 2023-02-14

**Features**

- support highlighted lines in `LineNumbers` through the `highlightedLines` prop

## [7.1.2](https://github.com/metonym/svelte-highlight/releases/tag/v7.1.2) - 2023-01-01

**Fixes**

- correctly set top/bottom padding in `LineNumbers` if `code` is updated

## [7.1.1](https://github.com/metonym/svelte-highlight/releases/tag/v7.1.1) - 2022-12-31

**Fixes**

- republish package

## [7.1.0](https://github.com/metonym/svelte-highlight/releases/tag/v7.1.0) - 2022-12-31

**Features**

- add `startingLineNumber` prop to `LineNumbers`

## [7.0.1](https://github.com/metonym/svelte-highlight/releases/tag/v7.0.1) - 2022-12-30

**Fixes**

- reset `table` styles in `LineNumbers`

## [7.0.0](https://github.com/metonym/svelte-highlight/releases/tag/v7.0.0) - 2022-12-30

**Breaking Changes**

- rename langtag style props
  - `--hljs-background` -> `--langtag-background`
  - `--hljs-foreground` -> `--langtag-color`
  - `--hljs-radius` -> `--langtag-border-radius`
- mark `code`, `language` as required props

**Features**

- include inferred `language` in `on:highlight` event detail in `HighlightAuto`
- add `LineNumbers` component to support rendering line numbers
- upgrade `highlight.js` to version [11.7.0](https://github.com/highlightjs/highlight.js/releases/tag/11.7.0)

**Fixes**

- use `HTMLAttributes` from `svelte/elements` to correctly type `$$restProps`

## [6.2.1](https://github.com/metonym/svelte-highlight/releases/tag/v6.2.1) - 2022-08-07

**Fixes**

- generate types for `svelte-highlight/languages/*`, `svelte-highlight/styles/*`

**Documentation**

- add dynamic import example
- document CDN styles usage
- use TypeScript in all example set-ups
- remove Snowpack example as it is no longer maintained
- update set-up instructions for SvelteKit/Vite

## [6.2.0](https://github.com/metonym/svelte-highlight/releases/tag/v6.2.0) - 2022-07-13

**Features**

- upgrade `highlight.js` to version [11.6.0](https://github.com/highlightjs/highlight.js/releases/tag/11.6.0) (net +2 styles)

## [6.1.1](https://github.com/metonym/svelte-highlight/releases/tag/v6.1.1) - 2022-07-02

**Fixes**

- remove `language` prop type from `HighlightAuto` TypeScript definitions

## [6.1.1](https://github.com/metonym/svelte-highlight/releases/tag/v6.1.1) - 2022-06-27

**Refactor**

- remove unnecessary `language` null check when setting `data-language` attribute
- reduce `.langtag` CSS specificity

## [6.1.0](https://github.com/metonym/svelte-highlight/releases/tag/v6.1.0) - 2022-06-10

**Features**

- port Svelte components to TypeScript

**Documentation**

- fix prop table types and default values

## [6.0.1](https://github.com/metonym/svelte-highlight/releases/tag/v6.0.1) - 2022-03-26

**Fixes**

- update generated `SUPPORTED_LANGUAGES.md` and `SUPPORTED_STYLES.md`

## [6.0.0](https://github.com/metonym/svelte-highlight/releases/tag/v6.0.0) - 2022-03-26

**Breaking Changes**

- use SvelteKit to package the library and auto-generate TypeScript definitions
  - styles are moved from `src/styles` to `styles`
  - languages are moved from `src/languages` to `languages`

## [5.3.2](https://github.com/metonym/svelte-highlight/releases/tag/v5.3.2) - 2022-03-16

- specify in docs that Vite should optimize both "highlight.js" and "highlight.js/lib/core" if using SvelteKit or Vite

## [5.3.1](https://github.com/metonym/svelte-highlight/releases/tag/v5.3.1) - 2022-03-16

- use default highlight.js library for `HighlightAuto`

## [5.3.0](https://github.com/metonym/svelte-highlight/releases/tag/v5.3.0) - 2022-03-12

- upgrade `highlight.js` to version 11.5.0 (net +1 language, +3 styles)

## [5.2.2](https://github.com/metonym/svelte-highlight/releases/tag/v5.2.2) - 2022-02-25

- use default export from `highlight.js/lib/core.js`

## [5.2.1](https://github.com/metonym/svelte-highlight/releases/tag/v5.2.1) - 2022-02-11

- remove whitespace from `pre`tags because Svelte v3.46.4 now preserves`pre` whitespace

## [5.2.0](https://github.com/metonym/svelte-highlight/releases/tag/v5.2.0) - 2022-01-06

- upgrade `highlight.js` to version 11.4.0 (net +1 style)

## [5.1.4](https://github.com/metonym/svelte-highlight/releases/tag/v5.1.4) - 2021-12-18

- recommend installing `highlight.js` as a dependency for pnpm users

## [5.1.3](https://github.com/metonym/svelte-highlight/releases/tag/v5.1.3) - 2021-11-13

- patch `highlight.js` to version 11.3.1

## [5.1.2](https://github.com/metonym/svelte-highlight/releases/tag/v5.1.2) - 2021-10-19

**Fixes**

- move TypeScript definitions components to the `src/` folder

## [5.1.1](https://github.com/metonym/svelte-highlight/releases/tag/v5.1.1) - 2021-10-19

**Fixes**

- emit TypeScript definitions for languages and styles to the `src/` folder

## [5.1.0](https://github.com/metonym/svelte-highlight/releases/tag/v5.1.0) - 2021-10-17

**Features**

- upgrade `highlight.js` to v11.3.0

## [5.0.0](https://github.com/metonym/svelte-highlight/releases/tag/v5.0.0) - 2021-10-08

**Breaking Changes**

- use `.svelte.d.ts` extension for TypeScript definitions

## [4.0.0](https://github.com/metonym/svelte-highlight/releases/tag/v4.0.0) - 2021-09-16

**Breaking Changes**

- move `.hljs` class from `pre` element to `code` to align with the intended usage of `highlight.js`
- change padding of `pre.langtag::after` to `1em` to prevent overpadding

## [3.4.0](https://github.com/metonym/svelte-highlight/releases/tag/v3.4.0) - 2021-09-12

**Features**

- add `data-language` attribute to `pre` element to allow targeted styling
- add `langtag` prop that displays the highlighted language if enabled

## [3.3.0](https://github.com/metonym/svelte-highlight/releases/tag/v3.3.0) - 2021-09-01

**Features**

- include named language export in `src/languages/*` files

## [3.2.1](https://github.com/metonym/svelte-highlight/releases/tag/v3.2.1) - 2021-09-01

**Documentation**

- update link to live demo

## [3.2.0](https://github.com/metonym/svelte-highlight/releases/tag/v3.2.0) - 2021-08-02

**Features**

- upgrade `highlight.js` to v11.2.0

## [3.1.0](https://github.com/metonym/svelte-highlight/releases/tag/v3.1.0) - 2021-07-08

**Features**

- upgrade `highlight.js` to v11.1.0

## [3.0.0](https://github.com/metonym/svelte-highlight/releases/tag/v3.0.0) - 2021-05-30

**Breaking Changes**

- `github-gist` style removed from `highlight.js`

**Features**

- upgrade `highlight.js` to v11.0.0
  - +2 styles (`github-dark`, `github-dark-dimmed`)

## [2.1.0](https://github.com/metonym/svelte-highlight/releases/tag/v2.1.0) - 2021-05-21

**Features**

- upgrade `highlight.js` to v11.0.0-beta1
  - +1 language (`wren`)
  - +1 style (`colors`)

## [2.0.0](https://github.com/metonym/svelte-highlight/releases/tag/v2.0.0) - 2021-04-30

**Breaking Changes**

- upgrade `highlight.js` to the next major version (v11), which supports ESM
  - removed languages: `c-like`, `htmlbars`, `sql_more`

**Features**

- added languages: `nestedtext`, `wasm`
- 143 new styles

## [2.0.0-rc.1](https://github.com/metonym/svelte-highlight/releases/tag/v2.0.0-rc.1) - 2021-04-30

**Fixes**

- omit `.js` extension when importing `highlight.js` language
- sort `types/styles/index.d.ts` by name

## [2.0.0-rc.0](https://github.com/metonym/svelte-highlight/releases/tag/v2.0.0-rc.0) - 2021-04-30

**Breaking Changes**

- upgrade `highlight.js` to the next major version (v11), which supports ESM
  - removed languages: `c-like`, `htmlbars`, `sql_more`

**Features**

- added languages: `nestedtext`, `wasm`
- 143 new styles

## [1.0.1](https://github.com/metonym/svelte-highlight/releases/tag/v1.0.1) - 2021-04-23

**Fixes**

- fix typos in `README.md`

## [1.0.0](https://github.com/metonym/svelte-highlight/releases/tag/v1.0.0) - 2021-04-23

**Breaking Changes**

- upgrade `highlight.js` to version 10.7
- remove all forwarded events from `Highlight`, `HighlightSvelte`
- remove legacy component; replace with `Highlight.svelte` as the default export
- remove Rollup from build process; only ship Svelte source code and languages/styles as ESM
- remove `highlightjs-svelte` dependency; use XML/JavaScript/CSS as sublanguages

**Features**

- add `HighlightAuto` component that auto highlights code
- major bundle size improvements by using only the `core` library

**Fixes**

- correctly type languages/styles

**Other**

- drop Node.js v12 from Travis CI build config

**Documentation**

- use SvelteKit instead of Sapper for the documentation/live demo site
- provide correct NPM install command

## [0.7.1](https://github.com/metonym/svelte-highlight/releases/tag/v0.7.1) - 2021-02-13

**Fixes**

- include `types` folder in published files

## [0.7.0](https://github.com/metonym/svelte-highlight/releases/tag/v0.7.0) - 2021-02-13

**Features**

- include highlighted markup in dispatched event detail
- add TypeScript definitions

**Fixes**

- mark CSS styles as side effects

## [0.6.2](https://github.com/metonym/svelte-highlight/releases/tag/v0.6.2) - 2020-05-10

- Fix "language is undefined" error by falling back to unhighlighted code

## [0.6.1](https://github.com/metonym/svelte-highlight/releases/tag/v0.6.1) - 2020-05-10

- Refactor build process to reduce bundled package size

## [0.6.0](https://github.com/metonym/svelte-highlight/releases/tag/v0.6.0) - 2020-05-03

- Export new `Highlight`, `HighlightSvelte` components; maintain backwards compatibility with `Legacy` component

- Require svelte^3.20.x as a peer dependency due to usage of the `$$restProps` API

- Support Svelte syntax highlighting by wrapping `highlightjs-svelte`

- Dispatch `highlight` event

- Forward the following events to the `pre` element (on:click, on:mouseover, on:mouseenter, on:mouseleave, on:focus, on:blur)

## [0.5.0](https://github.com/metonym/svelte-highlight/releases/tag/v0.5.0) - 2020-03-27

- Add editable support by exporting `contenteditable`, `spellcheck` props
  ([#105](https://github.com/metonym/svelte-highlight/issues/105))

## [0.4.1](https://github.com/metonym/svelte-highlight/releases/tag/v0.4.1) - 2020-02-01

- Bump `highlight.js` version from `9.17.1` to `9.18.1`

## [0.4.0](https://github.com/metonym/svelte-highlight/releases/tag/v0.4.0) - 2019-12-18

- Pass `id`, `style`, `class` props to `pre` element
  ([#48](https://github.com/metonym/svelte-highlight/issues/48))

- Deprecate `darkula` style
  ([#49](https://github.com/metonym/svelte-highlight/issues/49))

## [0.3.5](https://github.com/metonym/svelte-highlight/releases/tag/v0.3.5) - 2019-12-14

- Use `gh-pages` to publish demo

- Move documentation for supported languages, styles to `docs` folder

## [0.3.4](https://github.com/metonym/svelte-highlight/releases/tag/v0.3.4) - 2019-12-14

- Bump highlight.js from 9.17.0 to 9.17.1

## [0.3.3](https://github.com/metonym/svelte-highlight/releases/tag/v0.3.3) - 2019-12-12

- Use consistent terminology when documenting usage

- Add version number to demo

## [0.3.2](https://github.com/metonym/svelte-highlight/releases/tag/v0.3.2) - 2019-12-12

- Upgrade highlight.js to v9.17.0

## [0.3.1](https://github.com/metonym/svelte-highlight/releases/tag/v0.3.1) - 2019-12-11

- Move `src/docs` folder to `demo`
  ([#36](https://github.com/metonym/svelte-highlight/issues/36))

- Document custom language highlighting in README
  ([#35](https://github.com/metonym/svelte-highlight/issues/35))

## [0.3.0](https://github.com/metonym/svelte-highlight/releases/tag/v0.3.0) - 2019-11-18

- Add `code` prop for dynamically updating code

## [0.2.2](https://github.com/metonym/svelte-highlight/releases/tag/v0.2.2) - 2019-11-17

- Add new live demo and remove storybook

## [0.2.1](https://github.com/metonym/svelte-highlight/releases/tag/v0.2.1) - 2019-11-15

- Document supported languages, styles

## [0.2.0](https://github.com/metonym/svelte-highlight/releases/tag/v0.2.0) - 2019-11-10

- Export highlight.js theme CSS files as JavaScript

## [0.1.1](https://github.com/metonym/svelte-highlight/releases/tag/v0.1.1) - 2019-11-09

- Fix broken `svelte` import by publishing `src` folder

## [0.1.0](https://github.com/metonym/svelte-highlight/releases/tag/v0.1.0) - 2019-11-09

- Initial release
