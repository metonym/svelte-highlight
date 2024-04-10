import fs from "node:fs";

const pkg = JSON.parse(
  fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);

/** Creates header metadata for supported languages/styles */
export const createMarkdown = (type: "Languages" | "Styles", len: number) =>
  `
# Supported ${type}

> ${len} ${type.toLowerCase()} exported from highlight.js@${
    pkg.dependencies["highlight.js"]
  }  
`;
