const utils = require("./utils");
const { buildLanguages } = require("./build-languages");
const { buildStyles } = require("./build-styles");

(async () => {
  await utils.fs.rmdir("src/languages", { recursive: true });
  await utils.fs.rmdir("src/styles", { recursive: true });
  await utils.fs.rmdir("types/src", { recursive: true });
  await utils.fs.mkdir("src/styles");
  await utils.fs.mkdir("src/languages");
  await utils.fs.mkdir("types/src");
  await utils.fs.mkdir("types/src/languages");
  await utils.fs.mkdir("types/src/styles");
  await buildLanguages();
  await buildStyles();
})();
