// Renders the view once in opentui's test renderer and prints the frame,
// with no terminal needed. Usage: bun run check [file]

import { createTestRenderer } from "@opentui/core/testing";
import { languageNameForPath } from "svelte-highlight/diff-languages";
import { loadLanguage } from "svelte-highlight/load-language";
import App from "./App.svelte";
import { mountOpentui } from "./opentui-renderer.js";
import { themes } from "./themes.js";

const file = process.argv[2] ?? new URL("./Code.svelte", import.meta.url).pathname;
const code = (await Bun.file(file).text()).replace(/\n$/, "");
const language = await loadLanguage(languageNameForPath(file) ?? "plaintext");

const lines = code.split("\n").length;
const { renderer, renderOnce, captureCharFrame, captureSpans, dispose } =
  await createTestRenderer({ width: 90, height: lines + 6 });
mountOpentui(App, renderer, {
  code,
  language,
  themes,
  file: file.split("/").at(-1),
});
await new Promise((resolve) => setTimeout(resolve));
await renderOnce();

console.log(captureCharFrame());
const colored = captureSpans()
  .lines.flatMap((line) => line.spans)
  .filter((span) => span.text.trim() !== "");
const colors = new Set(colored.map((span) => [...span.fg.buffer.slice(0, 3)].join(",")));
console.log(`${colored.length} styled runs in ${colors.size} colors`);
await dispose();
