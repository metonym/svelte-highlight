// BSV keywords Verilog also owns get relevance 0 so this grammar doesn't
// steal autodetection from plain (System)Verilog samples that merely
// contain a module/interface block.
const BSV_KEYWORDS =
  "module|0 interface|0 endmodule|0 endinterface|0 if|0 else|0 for|0 case|0 endcase|0 begin|0 end|0 " +
  "package import export method endmethod rule endrule rules action endaction actionvalue endactionvalue function endfunction typeclass endtypeclass instance endinstance deriving provisos return let while";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBsv(hljs) {
  // `Reg#(Bit#(8))`-style parameterized types; recurses on `self` for
  // nested generics.
  const TYPE_PARAM = {
    className: "type",
    begin: /\b[A-Z]\w*#\(/,
    end: /\)/,
    relevance: 0,
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      hljs.C_NUMBER_MODE,
    ]),
  };

  // Module/action binder -- BSV-only, Verilog has no equivalent operator.
  const BIND = {
    className: "operator",
    begin: /<-/,
    relevance: 8,
  };

  const OPERATOR = {
    className: "operator",
    begin: /<=|==|!=|&&|\|\|/,
    relevance: 0,
  };

  // Constructor-style module instantiations (mkRegU, mkFIFO, ...).
  const CTOR = {
    className: "built_in",
    begin: /\bmk[A-Z]\w*\b/,
    relevance: 0,
  };

  // Verilog-style sized literal: 8'hFF, 32'd10, 1'b0.
  const SIZED_LITERAL = {
    className: "number",
    begin: /\b\d+'[bBoOdDhH][0-9a-fA-F_xXzZ]+\b/,
    relevance: 0,
  };

  return {
    name: "bsv",
    aliases: ["bluespec"],
    keywords: {
      keyword: BSV_KEYWORDS,
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      BIND,
      OPERATOR,
      SIZED_LITERAL,
      TYPE_PARAM,
      CTOR,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineBsv(hljs);
}

export const bsv = { name: "bsv", register };
export default bsv;
