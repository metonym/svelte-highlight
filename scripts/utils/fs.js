const fs = require("fs");
const util = require("util");

const rmdir = util.promisify(fs.rmdir);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);

module.exports = { rmdir, mkdir, readFile, writeFile, copyFile };
