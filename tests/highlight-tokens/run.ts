// @depends-on src/HighlightTokens.svelte tests/highlight-tokens/Terminal.svelte
// Mounts Terminal.svelte with the object renderer and prints the tree as
// JSON, before and after an update. Run with
// `bun --conditions=svelte-custom-renderer`, so `svelte` resolves to the
// runtime that supports custom renderers (the test does this).

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import rust from "../../src/languages/rust.js";
import github from "../../src/themes/github.js";
import renderer, { serialize } from "./renderer.ts";

const ROOT = path.join(import.meta.dir, "../..");
const COMPONENTS = [
  "src/HighlightTokens.svelte",
  "tests/highlight-tokens/Terminal.svelte",
];
const tag = `.tmp-${process.pid}.js`;

const written: string[] = [];
try {
  for (const file of COMPONENTS) {
    const filename = path.join(ROOT, file);
    const { js } = compile(fs.readFileSync(filename, "utf8"), {
      filename,
      generate: "client",
      experimental: {
        customRenderer: path.join(import.meta.dir, "renderer.ts"),
      },
    });
    const out = `${filename}${tag}`;
    fs.writeFileSync(out, js.code.replaceAll('.svelte"', `.svelte${tag}"`));
    written.push(out);
  }

  const { flushSync, mount } = await import("svelte");
  const terminal = path.join(
    ROOT,
    `tests/highlight-tokens/Terminal.svelte${tag}`,
  );
  const { default: Terminal } = await import(pathToFileURL(terminal).href);

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
} finally {
  for (const out of written) fs.unlinkSync(out);
}
