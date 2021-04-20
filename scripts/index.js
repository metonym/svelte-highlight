const fs = require("./utils/fs");
const { buildLanguages } = require("./build-languages");
const { buildStyles } = require("./build-styles");

(async () => {
  await fs.rmdir("src/languages", { recursive: true });
  await fs.rmdir("src/styles", { recursive: true });
  await fs.mkdir("src/languages");
  await fs.mkdir("src/styles");
  await fs.rmdir("types/src", { recursive: true });
  await fs.mkdir("types/src");
  await fs.mkdir("types/src/languages");
  await fs.mkdir("types/src/styles");
  await buildLanguages();
  await buildStyles();
})();
