const ASYMPTOTE_KEYWORDS =
  "import include struct typedef static explicit const public private restricted unravel from access as operator new return if else for while do break continue";

const ASYMPTOTE_TYPES =
  "void bool bool3 int real pair triple string path path3 guide guide3 pen picture transform transform3 frame Label";

// Common drawing/canvas calls. Kept at relevance 0 individually -- they're
// ordinary function names, not a unique structural anchor on their own (the
// combination of a type table plus the path operators below is).
const ASYMPTOTE_BUILT_INS =
  "draw fill clip label dot arrow shipout size unitsize add erase write";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineAsymptote(hljs) {
  const STRING = {
    className: "string",
    variants: [
      // "TeX string": only \\ and \" are recognized escapes.
      { begin: /"/, end: /"/, contains: [{ begin: /\\[\\"]/ }] },
      // 'C string': full C-style escapes.
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // Longest first: `..controls` before `..`, `---` before `--` before `-`,
  // etc, so a path expression like `(0,0)..controls (1,1)..(2,0)` lexes as
  // intended instead of splitting into single-character operators.
  const OPERATOR = {
    className: "operator",
    begin:
      /\.\.controls\b|::|\^\^|---|--|\.\.|&&|\|\||==|!=|<=|>=|\+=|-=|\*=|\/=|%=|\+\+|[-.&|^+*/%<>=!?:,]/,
    relevance: 0,
  };

  return {
    name: "Asymptote",
    aliases: ["asy"],
    disableAutodetect: true,
    keywords: {
      keyword: ASYMPTOTE_KEYWORDS,
      type: ASYMPTOTE_TYPES,
      built_in: ASYMPTOTE_BUILT_INS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      hljs.C_NUMBER_MODE,
      OPERATOR,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineAsymptote(hljs);
}

export const asymptote = { name: "asymptote", register };
export default asymptote;
