// The same output with no Svelte at all: tokens, styles, escapes.
// Usage: bun plain [file] [theme]

import { languageNameForPath } from "svelte-highlight/diff-languages";
import { loadLanguage } from "svelte-highlight/load-language";
import { ensureRegistered, registry } from "svelte-highlight/registry";
import { styleTokens, toAnsi } from "svelte-highlight/styled-tokens";

const file = process.argv[2] ?? import.meta.path;
const themeName = process.argv[3] ?? "github-dark";

const language = await loadLanguage(languageNameForPath(file) ?? "plaintext");
const { default: theme } = await import(`svelte-highlight/themes/${themeName}`);
ensureRegistered(language);

const { events } = registry.highlight(await Bun.file(file).text(), {
  language: language.name,
});
console.log(toAnsi(styleTokens(events, theme)));
