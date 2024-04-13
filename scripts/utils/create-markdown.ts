import { dependencies } from "../../package.json";

/** Creates header metadata for supported languages/styles */
export const createMarkdown = (type: "Languages" | "Styles", len: number) =>
  `
# Supported ${type}

> ${len} ${type.toLowerCase()} exported from highlight.js@${
    dependencies["highlight.js"]
  }  
`;
