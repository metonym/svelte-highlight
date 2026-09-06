import typescriptRegister from "highlight.js/lib/languages/typescript";
import xmlRegister from "highlight.js/lib/languages/xml";

// Civet layers indentation-based control flow and word operators on top of
// TypeScript; only the additions below are Civet-specific.
const CIVET_KEYWORDS = [
  "unless",
  "until",
  "loop",
  "when",
  "then",
  "and",
  "or",
  "not",
  "is",
  "isnt",
];

const XML_TAG_BEGIN = /\B<[A-Za-z][\w:.-]*/;
const XML_TAG_END = /\/[A-Za-z][\w:.-]*>|\/>/;

/**
 * @param {RegExpMatchArray} match
 * @param {{ after: number }} param1
 */
const hasClosingTag = (match, { after }) => {
  const input = match.input;
  if (input === undefined) {
    return false;
  }
  const tag = `</${match[0].slice(1)}`;
  return input.indexOf(tag, after) !== -1;
};

/**
 * Same JSX-vs-generic disambiguation as highlight.js javascript/tsrx.js.
 * @param {RegExpMatchArray} match
 * @param {{ ignoreMatch: () => void }} response
 */
const isTrulyOpeningTag = (match, response) => {
  const { index, input } = match;
  if (index === undefined || input === undefined) {
    return;
  }
  const afterMatchIndex = match[0].length + index;
  const nextChar = input[afterMatchIndex];
  if (nextChar === "<" || nextChar === ",") {
    response.ignoreMatch();
    return;
  }
  if (nextChar === ">" && !hasClosingTag(match, { after: afterMatchIndex })) {
    response.ignoreMatch();
  }
};

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCivet(hljs) {
  const base = /** @type {any} */ (typescriptRegister(hljs));

  const DECLARATION_OP = {
    className: "operator",
    begin: /:=|\.=/,
    relevance: 5,
  };

  const PIPE_OP = {
    className: "operator",
    begin: /\|>/,
    relevance: 5,
  };

  const ARROW_OP = {
    className: "operator",
    begin: /->|=>/,
    relevance: 0,
  };

  const THIS_SHORTHAND = {
    className: "variable.language",
    begin: /@/,
    relevance: 0,
  };

  const BLOCK_COMMENT = {
    className: "comment",
    begin: /###/,
    end: /###/,
  };

  const jsxElement = {
    begin: XML_TAG_BEGIN,
    end: XML_TAG_END,
    subLanguage: "xml",
    relevance: 0,
    "on:begin": isTrulyOpeningTag,
    contains: [
      {
        begin: XML_TAG_BEGIN,
        end: XML_TAG_END,
        skip: true,
        contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
          "self",
        ]),
      },
    ],
  };

  return {
    name: "Civet",
    aliases: ["civet"],
    keywords: {
      ...base.keywords,
      keyword: [
        ...new Set([
          .../** @type {string[]} */ (base.keywords.keyword),
          ...CIVET_KEYWORDS,
        ]),
      ],
    },
    contains: [
      jsxElement,
      BLOCK_COMMENT,
      hljs.HASH_COMMENT_MODE,
      DECLARATION_OP,
      PIPE_OP,
      ARROW_OP,
      THIS_SHORTHAND,
      ...base.contains,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("xml", xmlRegister);
  return defineCivet(hljs);
}

export const civet = { name: "civet", register };
export default civet;
