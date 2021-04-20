const { format } = require("prettier");
const fs = require("./fs");
const path = require("path");

const PARSER = {
  '.md': "markdown",
  '.js': "babel",
  '.ts': "typescript",
  '.json': "json",
  '.css': 'css'
};

async function writeTo(file, source) {
  const value =
    typeof source === "string" ? source : JSON.stringify(source, null, 2);

  await fs.writeFile(file, format(value, { parser: PARSER[path.parse(file).ext] }));
}

module.exports = { writeTo };
