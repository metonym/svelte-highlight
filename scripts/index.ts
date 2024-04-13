import { $ } from "bun";

import { buildLanguages } from "./build-languages";
import { buildStyles } from "./build-styles";

await $`rm -rf www/data; mkdir www/data`;
await buildLanguages();
await buildStyles();
