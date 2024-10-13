import type { SvelteComponentTyped } from "svelte";

export default class ScopedStyle extends SvelteComponentTyped<
  {
    moduleName: import("./scoped-style.d.ts").ScopedModuleName;
    content: `<style>${string}</style>`;
  },
  {},
  {}
> {}
