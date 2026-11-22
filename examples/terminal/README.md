# examples/terminal

> `svelte-highlight` in a terminal, through a Svelte custom renderer.

## Available Scripts

### `bun start [file] [theme]`

Prints `file` highlighted with `theme` (default `github-dark`). It mounts `src/Code.svelte`, which renders `HighlightTokens` into `<line>` and `<text>` elements, with the small terminal renderer in `src/renderer.js`.

### `bun plain [file] [theme]`

Prints the same thing with no Svelte: `styleTokens` and `toAnsi` from `svelte-highlight/styled-tokens`.

## How it fits together

- `svelte-plugin.js` compiles every `.svelte` file with the terminal renderer, including `svelte-highlight/HighlightTokens.svelte`. A component and the snippets it renders must use the same renderer.
- `bun start` runs with `--conditions=svelte-custom-renderer`, so `svelte` resolves to the runtime that supports custom renderers.
- `draw` in `src/renderer.js` reads the tree back and prints it with `toAnsi`.

Needs a terminal with true-color support, and Svelte 5.59 or later.
