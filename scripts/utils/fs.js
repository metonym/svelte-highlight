const fs = require("fs");
const { promisify } = require("util");

const rmdir = promisify(fs.rmdir);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);

module.exports = { rmdir, mkdir, readFile, writeFile, copyFile };
