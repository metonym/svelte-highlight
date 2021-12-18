import { mkdir } from "./utils/fs.js";
import { buildLanguages } from "./build-languages.js";
import { buildStyles } from "./build-styles.js";

mkdir("src/styles");
mkdir("src/languages");
await buildLanguages();
await buildStyles();
