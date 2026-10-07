import { $ } from "bun";

import { buildAliases, buildLanguages } from "./build-languages.ts";
import { buildStyles } from "./build-styles.ts";
import { buildThemes } from "./build-themes.ts";
import { convertGrammars } from "./convert-grammars.ts";

await $`rm -rf www/data; mkdir www/data`;

// Styles/themes are independent of the languages -> grammars -> aliases chain.
const stylesChain = buildStyles().then(({ themeInputs }) =>
  buildThemes(themeInputs),
);
await buildLanguages();
await convertGrammars();
await buildAliases();
await stylesChain;
