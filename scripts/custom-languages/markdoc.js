import markdownRegister from "highlight.js/lib/languages/markdown";
import yamlRegister from "highlight.js/lib/languages/yaml";

const MARKDOC_FUNCTIONS = "equals and or not if default debug";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMarkdoc(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const VARIABLE = {
    className: "variable",
    begin: /\$[A-Za-z_][\w.]*/,
    relevance: 0,
  };

  const FUNCTION_CALL = {
    className: "built_in",
    begin: new RegExp(
      `\\b(?:${MARKDOC_FUNCTIONS.split(" ").join("|")})(?=\\()`,
    ),
    relevance: 0,
  };

  const ATTR_NAME = {
    className: "attr",
    begin: /\b[A-Za-z_][\w-]*(?=\s*=)/,
    relevance: 0,
  };

  const SHORTHAND = {
    className: "symbol",
    begin: /[#.][A-Za-z_][\w-]*/,
    relevance: 0,
  };

  const SLASH_MARKER = {
    className: "template-tag",
    begin: /\//,
    relevance: 0,
  };

  const TAG_NAME = {
    className: "title function_",
    begin: /(?!true\b|false\b|null\b)[A-Za-z_][\w-]*(?!\s*[=(])/,
    relevance: 0,
  };

  const TAG = {
    begin: /\{%-?/,
    end: /-?%\}/,
    beginScope: "template-tag",
    endScope: "template-tag",
    relevance: 10,
    keywords: {
      literal: "true false null",
    },
    contains: [
      SLASH_MARKER,
      ATTR_NAME,
      FUNCTION_CALL,
      TAG_NAME,
      STRING,
      VARIABLE,
      SHORTHAND,
      hljs.C_NUMBER_MODE,
    ],
  };

  const COMMENT = {
    className: "comment",
    begin: /\{%-?\s*comment\s*-?%\}/,
    end: /\{%-?\s*\/comment\s*-?%\}/,
  };

  // Frontmatter only at the start of the document. Same shape as mdx/astro:
  // the opening fence consumes its trailing newline so `end` cannot match
  // the same line, `returnEnd` hands the closing fence to the sibling meta
  // rule, and `on:begin` compiles to `onlyAtInputStart` so a Markdoc table
  // separator (`---`) mid-document cannot open YAML and swallow
  // `{% /table %}`.
  const FRONTMATTER = {
    begin: /^---[ \t]*\n/,
    end: /^---[ \t]*$/m,
    subLanguage: "yaml",
    beginScope: "meta",
    returnEnd: true,
    /** @type {import("highlight.js").ModeCallback} */
    "on:begin": (match, response) => {
      if (match.index !== 0) {
        response.ignoreMatch();
      }
    },
  };

  const FRONTMATTER_CLOSE = {
    begin: /^---[ \t]*$/m,
    className: "meta",
    relevance: 0,
  };

  return {
    name: "Markdoc",
    aliases: ["mdoc"],
    subLanguage: "markdown",
    contains: [FRONTMATTER, FRONTMATTER_CLOSE, COMMENT, TAG],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("markdown", markdownRegister);
  hljs.registerLanguage("yaml", yamlRegister);
  return defineMarkdoc(hljs);
}

export const markdoc = { name: "markdoc", register };
export default markdoc;
