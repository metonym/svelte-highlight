// Generic OOP/control-flow words shared with the C-family (class, if, else,
// while, for, return, break, new, this, null, static, var, const, in, as)
// are marked `|0` - detection instead rests on the method/contract
// vocabulary (method, function, predicate, lemma, requires, ensures,
// modifies, reads, invariant, decreases, ghost, datatype) that's distinctive
// to Dafny.
const DAFNY_KEYWORDS =
  "method function predicate lemma constructor ghost " +
  "requires ensures modifies reads invariant decreases datatype " +
  "assert assume print forall exists opened refines abstract " +
  "class|0 trait|0 var|0 const|0 static|0 match|0 case|0 if|0 else|0 while|0 for|0 " +
  "return|0 break|0 new|0 this|0 null|0 include|0 import|0 module|0 export|0 " +
  "in|0 as|0 is|0 set|0 seq|0 map|0 multiset|0 array|0 extends|0";

const DAFNY_LITERALS = "true false";

const DAFNY_BUILT_INS =
  "int nat bool real char string object array seq set map multiset";

const IDENT_RE = /[A-Za-z_][A-Za-z0-9_']*/;

/** @param {import("highlight.js").HLJSApi} hljs */
function defineDafny(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  // `method`/`function`/`predicate`/`lemma` signatures. `requires`/`ensures`
  // keep ordinary keyword relevance below - not raised here - since F* also
  // uses them; only this header anchor is distinctive to Dafny.
  const METHOD_HEADER = {
    begin: [/\b(?:method|function|predicate|lemma)\s+/, IDENT_RE],
    beginScope: { 2: "title.function" },
    relevance: 5,
  };

  // `class`/`trait` are common OOP words shared with many C-family
  // languages, so this header only scopes the name - it doesn't raise
  // relevance. `datatype` is Dafny-distinctive and keeps its keyword weight.
  const CLASS_HEADER = {
    begin: [/\b(?:class|datatype|trait)\s+/, IDENT_RE],
    beginScope: { 2: "title.class" },
    relevance: 0,
  };

  // Longest first: `<==>` before `<==` before `<=`; `==>` before `==`;
  // `!!`/`!in`/`!=` before a bare `!` (unused elsewhere).
  const OPERATOR = {
    className: "operator",
    begin: /<==>|<==|==>|!!|!in\b|!=|==|<=|>=|<|>|:=|::|\.\.|\+|-|\*|\/|%/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?)\b/,
    relevance: 0,
  };

  return {
    name: "Dafny",
    aliases: ["dfy"],
    keywords: {
      keyword: DAFNY_KEYWORDS,
      literal: DAFNY_LITERALS,
      built_in: DAFNY_BUILT_INS,
    },
    contains: [
      hljs.COMMENT(/\/\//, /$/),
      hljs.COMMENT(/\/\*/, /\*\//),
      STRING,
      METHOD_HEADER,
      CLASS_HEADER,
      OPERATOR,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineDafny(hljs);
}

export const dafny = { name: "dafny", register };
export default dafny;
