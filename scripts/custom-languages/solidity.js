const SOLIDITY_KEYWORDS =
  "pragma import as from using is abstract contract interface library " +
  "function modifier constructor fallback receive event error struct enum " +
  "mapping returns return if else for while do break continue throw emit " +
  "try catch revert assembly unchecked new delete override virtual " +
  "public private internal external pure view payable constant immutable " +
  "storage memory calldata indexed anonymous type this super " +
  "selfdestruct";

const SOLIDITY_LITERALS =
  "true false wei gwei szabo finney ether " +
  "seconds minutes hours days weeks years";

const SOLIDITY_BUILT_INS =
  "msg block tx abi require assert keccak256 sha256 ripemd160 ecrecover " +
  "addmod mulmod gasleft blockhash now";

const SOLIDITY_TYPE = {
  className: "type",
  begin:
    /\b(?:address|bool|string|byte|(?:u?int|bytes)\d{0,3}|u?fixed(?:\d{1,3}x\d{1,2})?)\b/,
  relevance: 0,
};

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSolidity(hljs) {
  const NATSPEC = {
    className: "doctag",
    begin:
      /@(?:title|author|notice|dev|param|return|inheritdoc|custom:[\w-]+)\b/,
  };

  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      { begin: /\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /(?:hex|unicode)?"/,
        end: /"/,
        illegal: /\n/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      {
        begin: /(?:hex|unicode)?'/,
        end: /'/,
        illegal: /\n/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
    ],
  };

  return {
    name: "Solidity",
    aliases: ["sol"],
    keywords: {
      keyword: SOLIDITY_KEYWORDS,
      literal: SOLIDITY_LITERALS,
      built_in: SOLIDITY_BUILT_INS,
    },
    contains: [
      hljs.COMMENT(/\/\/\//, /$/, { contains: [NATSPEC] }),
      hljs.COMMENT(/\/\*\*/, /\*\//, { contains: [NATSPEC] }),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      NUMBER,
      SOLIDITY_TYPE,
      {
        // Only the contract/interface/library's own name is captured here
        // (via the bounded 3-part begin); an unconditional nested `title`
        // matcher previously kept re-firing for the rest of the header,
        // tagging the `is` keyword and every inherited contract name in
        // `contract Foo is Ownable, ReentrancyGuard {` as `title` too.
        begin: [/\b(?:contract|interface|library)\b/, /\s+/, /[A-Za-z_]\w*/],
        beginScope: { 1: "keyword", 3: "title" },
        end: /\{/,
        excludeEnd: true,
        // Same keyword table as the top level: if `end` never finds a `{`
        // (malformed/partial input -- every real declaration has a body),
        // this mode never closes, but keyword coloring for the rest of the
        // document still degrades gracefully instead of going dark.
        keywords: {
          keyword: SOLIDITY_KEYWORDS,
          literal: SOLIDITY_LITERALS,
          built_in: SOLIDITY_BUILT_INS,
        },
        contains: [
          { className: "title class_", begin: /\b[A-Z]\w*/, relevance: 0 },
        ],
      },
      {
        beginKeywords:
          "function modifier event error constructor fallback receive",
        end: /[({]/,
        excludeEnd: true,
        contains: [{ className: "title function_", begin: /[A-Za-z_]\w*/ }],
        keywords: SOLIDITY_KEYWORDS,
      },
      { className: "title class_", begin: /\b[A-Z]\w*/, relevance: 0 },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSolidity(hljs);
}

export const solidity = { name: "solidity", register };
export default solidity;
