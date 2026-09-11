const SOLIDITY_KEYWORDS =
  "pragma import as from using is abstract contract interface library " +
  "function modifier constructor fallback receive event error struct enum " +
  "mapping returns return if else for while do break continue throw emit " +
  "try catch revert assembly unchecked new delete override virtual " +
  "public private internal external pure view payable constant immutable " +
  "storage memory calldata indexed anonymous type this super " +
  "selfdestruct transient global";

const SOLIDITY_LITERALS =
  "true false wei gwei szabo finney ether " +
  "seconds minutes hours days weeks years";

const SOLIDITY_BUILT_INS =
  "msg block tx abi require assert keccak256 sha256 ripemd160 ecrecover " +
  "addmod mulmod gasleft blockhash now";

// Yul, the language of `assembly { ... }` blocks. Its keyword set is
// disjoint from Solidity's (`let`, `leave`, `:=`) and its "functions" are
// EVM opcodes, so the block gets its own keyword table.
const YUL_KEYWORDS = {
  keyword: "let function if switch case default for leave break continue",
  literal: "true false",
  built_in:
    "stop add sub mul div sdiv mod smod exp not lt gt slt sgt eq iszero " +
    "and or xor byte shl shr sar addmod mulmod signextend keccak256 " +
    "pc pop mload mstore mstore8 sload sstore tload tstore mcopy msize gas " +
    "address balance selfbalance caller callvalue calldataload calldatasize " +
    "calldatacopy codesize codecopy extcodesize extcodecopy returndatasize " +
    "returndatacopy extcodehash create create2 call callcode delegatecall " +
    "staticcall return revert selfdestruct invalid log0 log1 log2 log3 log4 " +
    "chainid basefee blobbasefee origin gasprice blockhash blobhash coinbase " +
    "timestamp number difficulty prevrandao gaslimit " +
    "datasize dataoffset datacopy setimmutable loadimmutable linkersymbol " +
    "memoryguard verbatim",
};

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
      { begin: /\b0[xX][0-9a-fA-F_]+\b/ },
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

  // `assembly { ... }`: the opening brace is part of `begin`, so the mode
  // ends at its matching `}` as long as every nested `{ ... }` (switch
  // cases, for-loop bodies, function bodies) is consumed by YUL_BLOCK, which
  // recurses via `self`.
  const YUL_CONTAINS = [
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING,
    NUMBER,
  ];

  const YUL_BLOCK = {
    begin: /\{/,
    end: /\}/,
    keywords: YUL_KEYWORDS,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      ...YUL_CONTAINS,
      "self",
    ]),
    relevance: 0,
  };

  const ASSEMBLY = {
    begin: [/\bassembly\b/, /\s*/, /(?:\(\s*"[^"]*"\s*\)\s*)?/, /\{/],
    beginScope: { 1: "keyword", 3: "string" },
    end: /\}/,
    keywords: YUL_KEYWORDS,
    contains: [...YUL_CONTAINS, YUL_BLOCK],
    relevance: 0,
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
      ASSEMBLY,
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
