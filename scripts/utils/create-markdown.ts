import { version as hljsVersion } from "highlight.js/package.json" with {
  type: "json",
};

/** Creates header metadata for supported languages/styles */
export const createMarkdown = (
  type: "Languages" | "Styles" | "Themes",
  len: number,
  customCount = 0,
) => {
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
