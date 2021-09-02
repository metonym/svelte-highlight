import { rmdir, mkdir } from "./utils/fs.js";
import { buildLanguages } from "./build-languages.js";
import { buildStyles } from "./build-styles.js";

(async () => {
  await rmdir("src/languages", { recursive: true });
  await rmdir("src/styles", { recursive: true });
  await rmdir("types/src", { recursive: true });
  await mkdir("src/styles");
  await mkdir("src/languages");
  await mkdir("types/src");
  await mkdir("types/src/languages");
  await mkdir("types/src/styles");
  await buildLanguages();
  await buildStyles();
})();
