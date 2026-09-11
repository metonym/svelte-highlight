// `extcall`/`staticcall`, the module statements `initializes`/`uses`/
// `exports`, and `transient(...)` storage arrived in Vyper 0.4.0.
const VYPER_KEYWORDS =
  "def return if elif else for in while pass break continue assert raise event struct interface enum flag implements initializes uses exports import from as constant immutable transient public private external internal payable nonpayable view pure indexed log extcall staticcall and or not range";

// Core builtin functions. Vyper reserves these names, so they can't be
// shadowed by user identifiers.
const VYPER_BUILT_INS =
  "convert as_wei_value max_value min_value epsilon len concat slice extract32 " +
  "abs floor ceil sqrt isqrt pow_mod256 uint2str method_id abi_encode abi_decode " +
  "unsafe_add unsafe_sub unsafe_mul unsafe_div raw_call raw_log raw_revert send " +
  "selfdestruct sha256 keccak256 ecrecover ecadd ecmul blockhash blobhash " +
  "create_minimal_proxy_to create_copy_of create_from_blueprint print breakpoint";

const VYPER_TYPES =
  "uint8 uint16 uint32 uint64 uint128 uint256 int8 int16 int32 int64 int128 int256 address bool bytes32 bytes Bytes String string decimal HashMap DynArray map";

const VYPER_LITERALS = "True False self msg block tx chain empty";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineVyper(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { begin: /\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const DECORATOR = {
    className: "meta",
    begin: /@[a-zA-Z_]\w*/,
    relevance: 0,
  };

  const FUNCTION = {
    begin: [/\bdef/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title.function" },
  };

  const NAMED_DECLARATION = {
    begin: [/\b(?:struct|interface|event|enum|flag)/, /\s+/, /[a-zA-Z_]\w*/],
    beginScope: { 1: "keyword", 3: "title class_" },
  };

  return {
    name: "Vyper",
    aliases: ["vyper"],
    keywords: {
      keyword: VYPER_KEYWORDS,
      type: VYPER_TYPES,
      literal: VYPER_LITERALS,
      built_in: VYPER_BUILT_INS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      { className: "string", begin: /"""/, end: /"""/ },
      {
        className: "string",
        begin: /b"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      {
        className: "string",
        begin: /b'/,
        end: /'/,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      DECORATOR,
      NAMED_DECLARATION,
      FUNCTION,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineVyper(hljs);
}

export const vyper = { name: "vyper", register };
export default vyper;
