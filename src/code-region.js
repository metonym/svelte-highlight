// CodeWindow shares its `title || label` with the code block inside it, so
// the block's scrollable region takes the window's name. The block keeps the
// only tab stop; a second, focusable wrapper would scroll nothing.
//
// This module imports nothing, so components call `getContext` and
// `setContext` themselves with the key.

/** Context key for the store that holds the CodeWindow label. */
export const CODE_REGION = Symbol("svelte-highlight:code-region");

/**
 * Store for code blocks outside a CodeWindow. It always holds `undefined`.
 * @type {import("svelte/store").Readable<string | undefined>}
 */
export const NO_REGION_LABEL = {
  subscribe(run) {
    run(undefined);
    return () => {};
  },
};
