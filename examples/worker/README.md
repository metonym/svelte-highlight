# examples/worker

> `svelte-highlight` Web Worker set-up.

## Available Scripts

### `bun dev`

Runs the project in development mode and watches for any changes.

### `bun run build`

Builds the project for production.

### `bun preview`

Preview the app locally. Run `bun run build` first.

## What this demonstrates

`App.svelte` generates a ~1 MB TypeScript file on mount and highlights it via `createWorkerHighlighter`, which round-trips the call through `highlight.worker.js` (a two-line `serveHighlighter()` recipe). While the highlight is pending, a counter driven by `setInterval` keeps animating on the main thread — visible proof that tokenizing a multi-MB file isn't blocking the UI, rather than something merely asserted.
