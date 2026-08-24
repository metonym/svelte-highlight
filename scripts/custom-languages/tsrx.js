import cssRegister from "highlight.js/lib/languages/css";
import typescriptRegister from "highlight.js/lib/languages/typescript";
import xmlRegister from "highlight.js/lib/languages/xml";

const TSRX_DIRECTIVES =
  "if|else|for|empty|switch|case|default|try|catch|pending";

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
 * Same JSX-vs-generic disambiguation as highlight.js javascript. Converted
 * to `xmlTagGuard` (look for `hasClosingTag(`).
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
  const afterMatch = input.substring(afterMatchIndex);
  if (/^\s*=/.test(afterMatch) || /^\s+extends\s+/.test(afterMatch)) {
    response.ignoreMatch();
  }
};

function createDirective() {
  return {
    begin: new RegExp(String.raw`@(?:${TSRX_DIRECTIVES})\b`),
    className: "keyword",
    relevance: 10,
  };
}

function createClosingTag() {
  // `</style>` is returned from the CSS `starts` region; without this
  // it falls back to the TypeScript host and renders as plain text.
  return {
    begin: /<\/[A-Za-z][\w:.-]*/,
    end: />/,
    subLanguage: "xml",
    relevance: 0,
  };
}

function createStyleBlock() {
  return {
    begin: /\B<style(?=\s|>)/,
    end: />/,
    subLanguage: "xml",
    relevance: 0,
    starts: {
      end: /<\/style>/,
      returnEnd: true,
      subLanguage: "css",
    },
  };
}

function createInterpolation() {
  // `{ <p>` is a directive/block body, not an expression.
  return {
    begin: /\{(?!\s*<)/,
    end: /\}/,
    subLanguage: "typescript",
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
    relevance: 0,
  };
}

/** @param {import("highlight.js").HLJSApi} _hljs */
function defineTsrx(_hljs) {
  // `@{` opens a statement container. Consume both characters so the token
  // is distinctive for auto-detect versus plain TypeScript/JSX.
  const statementContainer = {
    begin: /@\{/,
    className: "keyword",
    relevance: 10,
  };

  // Lazy destructure: `&{` / `&[` with no space. The spec treats `& {`
  // as bitwise-and plus a block, not a lazy pattern.
  const lazyDestructure = {
    begin: /&[{[]/,
    className: "keyword",
    relevance: 10,
  };

  // `<>` / `</>` stay tokens so the fragment body can mix TypeScript
  // statements with JSX. Named elements span to their close as xml so
  // text like `Loading stats` is markup, not a TypeScript class name.
  const jsxFragment = {
    begin: /<>|<\/>/,
    className: "tag",
    relevance: 0,
  };

  const jsxElement = {
    begin: XML_TAG_BEGIN,
    end: XML_TAG_END,
    subLanguage: "xml",
    relevance: 0,
    "on:begin": isTrulyOpeningTag,
    contains: [
      createDirective(),
      createStyleBlock(),
      createInterpolation(),
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
    name: "TSRX",
    aliases: ["tsrx"],
    subLanguage: "typescript",
    contains: [
      createDirective(),
      statementContainer,
      lazyDestructure,
      createStyleBlock(),
      jsxFragment,
      createClosingTag(),
      jsxElement,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("typescript", typescriptRegister);
  hljs.registerLanguage("css", cssRegister);
  hljs.registerLanguage("xml", xmlRegister);
  return defineTsrx(hljs);
}

export const tsrx = { name: "tsrx", register };
export default tsrx;
