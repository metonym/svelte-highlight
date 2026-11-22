// Mounts Terminal.svelte with the object renderer and prints the tree as
// JSON, before and after an update. svelte-bun compiles the components
// with the renderer, and resolves `svelte` to the runtime that supports
// custom renderers. The test runs this in its own process, away from the
// server compile the other tests register.

import path from "node:path";
import { plugin } from "bun";
import { svelte } from "svelte-bun";

plugin(
  svelte({
    compilerOptions: {
      experimental: {
        customRenderer: path.join(import.meta.dir, "renderer.ts"),
      },
    },
    onwarn: () => {},
  }),
);

// Imported once the plugin is registered, so it resolves them.
const { flushSync, mount } = await import("svelte");
const { default: renderer, serialize } = await import("./renderer.ts");
const { default: Terminal } = await import("./Terminal.svelte");
const { default: rust } = await import("../../src/languages/rust.js");
const { default: github } = await import("../../src/themes/github.js");

const target = renderer.createFragment();
const instance = mount(Terminal, {
  target,
  renderer,
  props: { code: "fn a() {}\nlet b = 1;", language: rust, theme: github },
});
const before = serialize(target);
instance.setCode("x");
flushSync();
console.log(JSON.stringify({ before, after: serialize(target) }));
