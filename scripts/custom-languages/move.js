const MOVE_KEYWORDS =
  "module script fun public entry native struct has let mut if else while loop return abort break continue use friend const acquires spec as move copy while invariant assume aborts_if ensures requires schema include phantom";

const MOVE_ABILITIES = "copy drop store key";

const MOVE_TYPES = "u8 u16 u32 u64 u128 u256 bool address vector signer";

const MOVE_LITERALS = "true false";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineMove(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      {
        begin: /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*(?:u(?:8|16|32|64|128|256))?\b/,
      },
      { begin: /\b\d[\d_]*(?:u(?:8|16|32|64|128|256))?\b/ },
    ],
    relevance: 0,
  };

  const ADDRESS = {
    className: "symbol",
    begin: /@(?:0x[0-9a-fA-F]+|[A-Za-z_]\w*)/,
    relevance: 0,
  };

  const TYPE = {
    className: "type",
    begin: /\b[A-Z]\w*/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bfun/, /\s+/, /[a-z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  return {
    name: "Move",
    aliases: ["move"],
    keywords: {
      keyword: `${MOVE_KEYWORDS} ${MOVE_ABILITIES}`,
      type: MOVE_TYPES,
      literal: MOVE_LITERALS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        begin: /b?"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      { className: "string", begin: /x"/, end: /"/ },
      ADDRESS,
      FUNCTION,
      TYPE,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineMove(hljs);
}

export const move = { name: "move", register };
export default move;
