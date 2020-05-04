const { buildHljsLanguages } = require("./buildHljsLanguages");
const { buildHljsStyles } = require("./buildHljsStyles");

(async () => {
  await buildHljsLanguages();
  await buildHljsStyles();
})();
