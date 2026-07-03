import { dependencies } from "../../package.json";

/** Creates header metadata for supported languages/styles */
export const createMarkdown = (
  type: "Languages" | "Styles",
  len: number,
  customCount = 0,
) => {
  const hljsVersion = dependencies["highlight.js"];
  const summary =
    customCount > 0
      ? `> ${len} ${type.toLowerCase()}: ${
          len - customCount
        } exported from highlight.js@${hljsVersion}, ${customCount} custom grammars added by svelte-highlight`
      : `> ${len} ${type.toLowerCase()} exported from highlight.js@${hljsVersion}`;

  return `# Supported ${type}

${summary}

`;
};
