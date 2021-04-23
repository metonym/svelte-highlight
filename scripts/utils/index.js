const { createMarkdown } = require("./create-markdown");
const fs = require("./fs");
const { toPascalCase } = require("./to-pascal-case");
const { writeTo } = require("./write-to");

module.exports = {
  createMarkdown,
  fs,
  toPascalCase,
  writeTo,
};
