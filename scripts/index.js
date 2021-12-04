import { rmdir, mkdir } from "./utils/fs.js";
import { buildLanguages } from "./build-languages.js";
import { buildStyles } from "./build-styles.js";

(async () => {
  await rmdir("src/languages", { recursive: true, force: true });
  await rmdir("src/styles", { recursive: true, force: true });
  await mkdir("src/styles");
  await mkdir("src/languages");
  await buildLanguages();
  await buildStyles();
})();
