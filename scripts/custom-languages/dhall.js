// `showConstructor` (Dhall 23.0.0) and the `missing` import join the table.
const DHALL_KEYWORDS =
  "let in if then else merge toMap assert as using with forall Some None showConstructor missing";

const DHALL_TYPES =
  "Natural Integer Double Text Bool Bytes Date Time TimeZone List Optional Type Kind Sort";

const DHALL_LITERALS = "True False NaN Infinity";

const DHALL_BUILTINS =
  "Natural/fold Natural/build Natural/isZero Natural/even Natural/odd Natural/toInteger Natural/show Natural/subtract List/build List/fold List/length List/head List/last List/indexed List/reverse Text/show Text/replace Optional/fold Optional/build Integer/show Integer/toDouble Integer/negate Integer/clamp Double/show Date/show Time/show TimeZone/show";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineDhall(hljs) {
  const NUMBER = {
    className: "number",
    variants: [
      // Bytes literal (Dhall 23.0.0): `0x"00FF"`.
      { begin: /\b0x"[0-9a-fA-F]*"/ },
      { begin: /\b0[xX][0-9a-fA-F]+\b/ },
      // Temporal literals (Dhall 22.0.0): a date with optional time and
      // zone, a bare time with optional zone, and a bare zone offset. They
      // sit before the plain number so `2024-01-15` isn't three numbers.
      {
        begin:
          /\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?\b/,
      },
      { begin: /\b\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b/ },
      { begin: /[+-]\d{2}:\d{2}\b/ },
      { begin: /[+-]?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
    ],
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    keywords: { keyword: DHALL_KEYWORDS, literal: DHALL_LITERALS },
  };

  const STRING = {
    className: "string",
    variants: [
      {
        begin: /''/,
        end: /''/,
        // `''${` is a literal `${` and `'''` a literal `''`; both must be
        // consumed before the `''` terminator or the string ends early and
        // the rest of the file is styled as text.
        contains: [{ begin: /''\$\{|'''/ }, INTERPOLATION],
      },
      {
        begin: /"/,
        end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
      },
    ],
  };

  const IMPORT = {
    className: "link",
    begin: /(?:https?:\/\/[^\s]+|env:[A-Za-z_]\w*|\.\.?\/[^\s]+)/,
    relevance: 0,
  };

  // Lambda/arrow forms plus the record (`//`, `/\`, `//\`), list (`#`),
  // text (`++`), equivalence (`===`), and alternative-import (`?`)
  // operators, each with its Unicode spelling.
  const OPERATOR = {
    className: "operator",
    begin: /\\|λ|∀|->|→|\/\/\\|\/\/|\/\\|⫽|∧|⩓|\+\+|===|≡|#|\?/,
    relevance: 0,
  };

  return {
    name: "Dhall",
    aliases: ["dhall"],
    keywords: {
      $pattern: "[A-Za-z_][A-Za-z0-9_/]*",
      keyword: DHALL_KEYWORDS,
      type: DHALL_TYPES,
      literal: DHALL_LITERALS,
      built_in: DHALL_BUILTINS,
    },
    contains: [
      hljs.COMMENT(/--/, /$/),
      // Block comments nest, so the inner `-}` must not close the outer.
      hljs.COMMENT(/\{-/, /-\}/, { contains: ["self"] }),
      STRING,
      IMPORT,
      NUMBER,
      OPERATOR,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineDhall(hljs);
}

export const dhall = { name: "dhall", register };
export default dhall;
