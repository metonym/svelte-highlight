// @ts-check
import fs from "fs";

const pkg = JSON.parse(
  fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8")
);

/**
 * Creates header metadata for supported languages/styles
 * @type {(type: "Languages" | "Styles", len: number) => string}
 */
export const createMarkdown = (type, len) =>
  `
# Supported ${type}

> ${len} ${type.toLowerCase()} exported from highlight.js@${
    pkg.dependencies["highlight.js"]
  }  
`;
