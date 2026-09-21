/** @param {import("highlight.js").HLJSApi} hljs */
function defineDialog(hljs) {
  // `$Var`, directional `$<Var` (input) / `$>Var` (output).
  const VARIABLE = {
    className: "variable",
    begin: /\$[<>]?[A-Za-z]\w*/,
    relevance: 0,
  };

  // Object references (`#foyer`) and style-class tags (`@status`).
  const SYMBOL = {
    className: "symbol",
    begin: /[#@][A-Za-z][\w-]*/,
    relevance: 0,
  };

  // Leading `~(` toggles/negates the predicate that follows -- lookahead is
  // fine here, only lookbehind is banned by tests/no-lookbehind.test.ts.
  const NEGATION = {
    className: "operator",
    begin: /~(?=\()/,
    relevance: 0,
  };

  // Control-flow words are written as whole parenthesized tokens with no
  // arguments -- `(if)`, `(then)`, `(else)`, `(elseif)`, `(endif)`, `(now)`
  // -- verified against real upstream source (stdlib.dg, cloak.dg). This is
  // the one truly distinctive anchor, so it's checked before the generic
  // predicate-call mode below.
  const CONTROL = {
    className: "keyword",
    begin: /\((?:if|then|else|elseif|endif|now)\)/,
    relevance: 5,
  };

  // Every other parenthesized phrase is a predicate call, e.g.
  // `(interface (name $<Obj))`. Self-recursive to balance nested calls.
  // relevance: 0 -- a bare paren pair is not distinctive on its own (hljs
  // defaults an unmarked mode to relevance 1, which would otherwise tie
  // Dialog with any other parenthesized language, e.g. plain Lisp/Prolog).
  const PREDICATE = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    contains: [
      /** @type {"self"} */ ("self"),
      VARIABLE,
      SYMBOL,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
    ],
  };

  return {
    name: "dialog",
    aliases: ["dg"],
    contains: [
      hljs.COMMENT("%", "$"),
      NEGATION,
      CONTROL,
      PREDICATE,
      VARIABLE,
      SYMBOL,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineDialog(hljs);
}

export const dialog = { name: "dialog", register };
export default dialog;
