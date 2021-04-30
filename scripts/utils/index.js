const { createMarkdown } = require("./create-markdown");
const fs = require("./fs");
const { toCamelCase } = require("./to-pascal-case");
const { writeTo } = require("./write-to");

module.exports = {
  createMarkdown,
  fs,
  toCamelCase,
  writeTo,
};
