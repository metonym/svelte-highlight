// Usage: bun start [file]
// Shows `file` (this script by default) highlighted in an opentui view.

import { createCliRenderer } from "@opentui/core";
import { languageNameForPath } from "svelte-highlight/diff-languages";
import { loadLanguage } from "svelte-highlight/load-language";
import App from "./App.svelte";
import { mountOpentui } from "./opentui-renderer.js";
import { themes } from "./themes.js";

const file = process.argv[2] ?? import.meta.path;
const code = (await Bun.file(file).text()).replace(/\n$/, "");
const language = await loadLanguage(languageNameForPath(file) ?? "plaintext");

const cli = await createCliRenderer({ exitOnCtrlC: true });
const view = mountOpentui(App, cli, {
  code,
  language,
  themes,
  file: file.split("/").at(-1),
  keys: cli.keyInput,
});

cli.keyInput.on("keypress", (key) => {
  if (key.name === "q") {
    view.destroy();
    cli.destroy();
    process.exit(0);
  }
});
