import { $ } from "bun";

import { buildDetectIndex } from "./build-detect-index.ts";
import { buildLanguages } from "./build-languages.ts";
import { buildStyles } from "./build-styles.ts";
import { buildThemes } from "./build-themes.ts";
import { convertGrammars } from "./convert-grammars.ts";

await $`rm -rf www/data; mkdir www/data`;
await buildLanguages();
const irByName = await convertGrammars();
await buildDetectIndex(irByName);
const { themeInputs } = await buildStyles();
await buildThemes(themeInputs);
