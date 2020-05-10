const fs = require("./utils/fs");
const { buildHljsLanguages } = require("./buildHljsLanguages");
const { buildHljsStyles } = require("./buildHljsStyles");

(async () => {
  await fs.rmdir("languages", { recursive: true });
  await fs.rmdir("styles", { recursive: true });
  await fs.rmdir("docs", { recursive: true });
  await fs.rmdir("dist", { recursive: true });
  await fs.mkdir("dist");
  await fs.mkdir("dist/languages");
  await fs.mkdir("dist/styles");
  await fs.mkdir("docs");
  await fs.mkdir("languages");
  await fs.mkdir("styles");
  await buildHljsLanguages();
  await buildHljsStyles();
})();
