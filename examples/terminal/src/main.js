// Usage: bun start [file] [theme]
// Prints `file` (this script by default) highlighted with `theme`
// (default github-dark), through a Svelte component and a terminal renderer.

import { mount, unmount } from "svelte";
import { languageNameForPath } from "svelte-highlight/diff-languages";
import { loadLanguage } from "svelte-highlight/load-language";
import Code from "./Code.svelte";
import renderer, { draw } from "./renderer.js";

const file = process.argv[2] ?? import.meta.path;
const themeName = process.argv[3] ?? "github-dark";

const code = (await Bun.file(file).text()).replace(/\n$/, "");
const language = await loadLanguage(languageNameForPath(file) ?? "plaintext");
const { default: theme } = await import(`svelte-highlight/themes/${themeName}`);

const target = renderer.createFragment();
const app = mount(Code, { target, renderer, props: { code, language, theme } });
console.log(draw(target));
unmount(app);
