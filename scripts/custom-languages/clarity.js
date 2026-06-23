const CLARITY_KEYWORDS =
  "define-public define-private define-read-only define-map define-data-var define-constant define-fungible-token define-non-fungible-token define-trait use-trait impl-trait let begin if match map-get? map-set map-insert map-delete var-get var-set contract-call? as-contract try! unwrap! unwrap-err! unwrap-panic unwrap-err-panic asserts! ok err some none print";

const CLARITY_BUILTINS =
  "and or not is-eq is-none is-some is-ok is-err map filter fold append concat len element-at index-of list tuple get merge to-uint to-int buff-to-int-le buff-to-uint-le buff-to-int-be buff-to-uint-be hash160 sha256 sha512 keccak256 secp256k1-recover? secp256k1-verify principal-of? stx-transfer? stx-burn? stx-get-balance ft-transfer? ft-mint? ft-burn? nft-transfer? nft-mint? nft-burn? nft-get-owner?";

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

  const KEYWORD_LITERAL = {
    className: "symbol",
    begin: /'[A-Z0-9]+(?:\.[a-zA-Z][\w-]*)?/,
    relevance: 0,
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
      hljs.QUOTE_STRING_MODE,
      KEYWORD_LITERAL,
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
