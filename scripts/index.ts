import { buildLanguages } from "./build-languages";
import { buildStyles } from "./build-styles";
import { mkdir } from "./utils/fs";

(async () => {
  mkdir("www/data");

  await buildLanguages();
  await buildStyles();
})();
