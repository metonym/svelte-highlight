# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
