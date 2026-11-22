# examples/terminal

> `svelte-highlight` in a terminal, through a Svelte custom renderer.

## Available Scripts

### `bun start [file] [theme]`

Prints `file` highlighted with `theme` (default `github-dark`). It mounts `src/Code.svelte`, which renders `HighlightTokens` into `<line>` and `<text>` elements, with the small terminal renderer in `src/renderer.js`.

### `bun plain [file] [theme]`

Prints the same thing with no Svelte: `styleTokens` and `toAnsi` from `svelte-highlight/styled-tokens`.

## How it fits together

- [svelte-bun](https://github.com/metonym/svelte-bun) compiles the `.svelte` files, preloaded from `bunfig.toml`. `svelte.config.js` names the terminal renderer, so every component compiles with it, `svelte-highlight/HighlightTokens.svelte` included. A component and the snippets it renders must use the same renderer.
- svelte-bun also resolves `svelte` to the runtime that supports custom renderers, so `bun start` needs no `--conditions` flag.
- `draw` in `src/renderer.js` reads the tree back and prints it with `toAnsi`.

Needs Bun canary (`bun upgrade --canary`), where svelte-bun applies the custom-renderer condition at runtime, Svelte 5.59 or later, and a terminal with true-color support.
