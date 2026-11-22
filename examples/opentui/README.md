# examples/opentui

> `svelte-highlight` in an [opentui](https://opentui.com) terminal view, through a Svelte custom renderer.

`bun start [file]` shows `file` highlighted in a bordered opentui box with line numbers. Press `t` to switch themes and `q` to quit.

## How it fits together

- `src/opentui-renderer.js` is a small Svelte custom renderer for opentui. Components render `<box>`, `<text>` and `<span>` elements, and `mountOpentui` turns them into opentui's `BoxRenderable`, `TextRenderable` and text nodes. A `<span>` takes `fg`, `bg`, `bold`, `italic`, `underline` and `strikethrough`.
- `src/Code.svelte` renders `HighlightTokens` from `svelte-highlight` into those elements, with the theme's colors on each token.
- [svelte-bun](https://github.com/metonym/svelte-bun) compiles the `.svelte` files, preloaded from `bunfig.toml`. `svelte.config.js` names the renderer, so every component compiles with it, `HighlightTokens.svelte` included, since a component and the snippets it renders must use the same renderer. svelte-bun also resolves `svelte` to the runtime that supports custom renderers, so no `--conditions` flag is needed.

The renderer rebuilds opentui's renderables after each change, which is simple and fast enough for a code view. A full opentui binding for Svelte would update them in place.

## Checking it without a terminal

`bun run check [file]` renders the view once in opentui's test renderer and prints the frame, with a count of the styled runs.

Needs Bun, Svelte 5.59 or later, and a terminal with true-color support.
