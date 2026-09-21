const VERYL_KEYWORDS =
  "module interface package function enum struct modport param localparam var let const always_ff always_comb if_reset if else for in return input output inout ref import embed unsafe inst pub proto initial final case switch assign";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineVeryl(hljs) {
  // Colon-typed port/field name, e.g. `i_clk: input clock`. Only meant to
  // fire in a port-list/struct-field position; a standalone ternary
  // (`cond ? a : b`) must not trip this (see the negative test).
  const TYPED_PORT = {
    className: "attr",
    begin: /\b[a-z_]\w*(?=\s*:)/,
    relevance: 0,
  };

  const GENERIC_TYPE = {
    className: "type",
    begin: /\b(?:logic|bit|clock|reset|u8|u16|u32|u64)\b(?:<[^>]*>)?/,
    relevance: 0,
  };

  // `#(param Width: u32 = 8, ...)` generic-parameter block; recurses on
  // `self` for nested parameter lists.
  const PARAM_BLOCK = {
    className: "punctuation",
    begin: /#\(/,
    end: /\)/,
    relevance: 0,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      TYPED_PORT,
      GENERIC_TYPE,
      hljs.C_NUMBER_MODE,
    ]),
  };

  const OPERATOR = {
    className: "operator",
    begin: /<->|::<|->|::|<=|:=/,
    relevance: 0,
  };

  // Scopes a ternary's `? true : ` span so TYPED_PORT's colon-lookahead
  // can't mistake the true-branch identifier for a port/field name (see the
  // negative test in tests/veryl-language.test.ts).
  const TERNARY_TRUE_BRANCH = {
    begin: /\?/,
    end: /:/,
    relevance: 0,
    contains: [hljs.C_NUMBER_MODE],
  };

  return {
    name: "veryl",
    // Veryl deliberately keeps "a familiar basic syntax for SystemVerilog
    // experts" (its own docs) -- most real modules (no if_reset, no pub,
    // plain `input`/`output` ports) are close enough to SystemVerilog that
    // autodetection would misclassify them as `verilog` far more often than
    // it would correctly pick `veryl`. Require an explicit language tag.
    disableAutodetect: true,
    keywords: {
      keyword: VERYL_KEYWORDS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      PARAM_BLOCK,
      OPERATOR,
      TERNARY_TRUE_BRANCH,
      GENERIC_TYPE,
      TYPED_PORT,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineVeryl(hljs);
}

export const veryl = { name: "veryl", register };
export default veryl;
