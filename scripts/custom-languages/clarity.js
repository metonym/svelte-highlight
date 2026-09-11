const CLARITY_KEYWORDS =
  "define-public define-private define-read-only define-map define-data-var define-constant define-fungible-token define-non-fungible-token define-trait use-trait impl-trait let begin if match map-get? map-set map-insert map-delete var-get var-set contract-call? as-contract try! unwrap! unwrap-err! unwrap-panic unwrap-err-panic asserts! ok err some none print";

// Clarity 2 added the consensus-buff, slice/replace-at, bit-*, principal-*
// and block-info functions; Clarity 3 added stacks-block-height,
// tenure-height, get-stacks-block-info? and get-tenure-info?.
const CLARITY_BUILTINS =
  "and or not is-eq is-none is-some is-ok is-err map filter fold append concat len element-at index-of list tuple get merge to-uint to-int buff-to-int-le buff-to-uint-le buff-to-int-be buff-to-uint-be hash160 sha256 sha512 keccak256 secp256k1-recover? secp256k1-verify principal-of? stx-transfer? stx-burn? stx-get-balance ft-transfer? ft-mint? ft-burn? nft-transfer? nft-mint? nft-burn? nft-get-owner? tx-sender contract-caller block-height burn-block-height stx-liquid-supply default-to " +
  "as-max-len? at-block contract-of chain-id is-in-regtest is-in-mainnet sqrti log2 pow mod xor " +
  "get-block-info? get-burn-block-info? to-consensus-buff? from-consensus-buff? slice? replace-at? " +
  "string-to-int? string-to-uint? int-to-ascii int-to-utf8 bit-and bit-or bit-xor bit-not " +
  "bit-shift-left bit-shift-right principal-construct? principal-destruct? is-standard " +
  "stx-account stx-transfer-memo? ft-get-balance ft-get-supply tx-sponsor? " +
  "stacks-block-height tenure-height get-stacks-block-info? get-tenure-info?";

const CLARITY_TYPES =
  "uint int bool principal buff string-ascii string-utf8 list optional response tuple";

const CLARITY_LITERALS = "true false none";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineClarity(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      { begin: /\bu\d+\b/ },
      { begin: /\b\d+\b/ },
      { begin: /\b0x[0-9a-fA-F]+\b/ },
    ],
    relevance: 0,
  };

  // Standard principals, optionally with `.contract` and `.trait` segments
  // (`'SP...ABC.nft-trait.nft-trait` in impl-trait / use-trait).
  const KEYWORD_LITERAL = {
    className: "symbol",
    begin: /'[A-Z0-9]+(?:\.[a-zA-Z][\w-]*){0,2}/,
    relevance: 0,
  };

  // Contract-relative references (`.other-contract`, `.sip-010-trait.sip-010-trait`).
  // Clarity has no float or member-access dots, so a leading `.` is always
  // one of these; consuming the whole name also keeps the number rule from
  // firing on a digit segment like `010`.
  const CONTRACT_REF = {
    className: "symbol",
    begin: /\.[a-zA-Z][\w-]*(?:\.[a-zA-Z][\w-]*)?/,
    relevance: 0,
  };

  // Hyphenated identifiers with a numeric segment (`ERR-404`) are consumed
  // whole so `\b\d+\b` doesn't style the segment as a number.
  const HYPHEN_NUMERIC_IDENT = {
    begin: /[a-zA-Z_][\w-]*-\d[\w-]*[?!]?/,
    relevance: 0,
  };

  const UTF8_STRING = {
    className: "string",
    begin: /u"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  return {
    name: "Clarity",
    aliases: ["clarity", "clar"],
    keywords: {
      $pattern: "[a-zA-Z_][a-zA-Z0-9_-]*[?!]?",
      keyword: CLARITY_KEYWORDS,
      built_in: CLARITY_BUILTINS,
      type: CLARITY_TYPES,
      literal: CLARITY_LITERALS,
    },
    contains: [
      hljs.COMMENT(/;;/, /$/),
      UTF8_STRING,
      hljs.QUOTE_STRING_MODE,
      KEYWORD_LITERAL,
      CONTRACT_REF,
      HYPHEN_NUMERIC_IDENT,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineClarity(hljs);
}

export const clarity = { name: "clarity", register };
export default clarity;
