import fs from "fs";

const pkg = JSON.parse(
  fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8")
);

/**
 * Creates header metadata for supported languages/styles
 * @param {"Languages" | "Styles"} type
 * @param {number} len
 * @returns {string}
 */
export function createMarkdown(type, len) {
  return `# Supported ${type}

> ${len} ${type.toLowerCase()} exported from highlight.js@${
    pkg.dependencies["highlight.js"]
  }  
`;
}
