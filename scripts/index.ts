import { $ } from "bun";

import { buildAliases, buildLanguages } from "./build-languages.ts";
import { buildStyles } from "./build-styles.ts";
import { buildThemes } from "./build-themes.ts";
import { convertGrammars } from "./convert-grammars.ts";

await $`rm -rf www/data; mkdir www/data`;

// Grammars must follow languages (they import the generated
// `src/languages/index.js`); the styles/themes chain is independent.
const stylesChain = buildStyles().then(({ themeInputs }) =>
  buildThemes(themeInputs),
);
await buildLanguages();
await convertGrammars();
// Aliases only land in each grammar module's register field once converted.
await buildAliases();
await stylesChain;
