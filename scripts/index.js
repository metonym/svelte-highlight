// @ts-check
import { buildLanguages } from "./build-languages.js";
import { buildStyles } from "./build-styles.js";
import { mkdir } from "./utils/fs.js";

(async () => {
  mkdir("www/data");

  await buildLanguages();
  await buildStyles();
})();
