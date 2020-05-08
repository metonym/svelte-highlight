const fs = require("fs");
const posthtml = require("posthtml");
const { hash } = require("posthtml-hash");
const htmlnano = require("htmlnano");

const html = fs.readFileSync("build/index.html");

posthtml([hash({ path: "build" }), htmlnano()])
  .process(html)
  .then((result) => fs.writeFileSync("build/index.html", result.html));
