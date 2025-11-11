import { $ } from "bun";

import { buildLanguages } from "./build-languages.ts";
import { buildStyles } from "./build-styles.ts";

await $`rm -rf www/data; mkdir www/data`;
await buildLanguages();
await buildStyles();
