import { createRegistry } from "../src/engine.js";

import antlr from "../src/languages/antlr";

const registry = createRegistry();

registry.register(antlr.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "antlr" }).value;

test("antlr highlights grammar declarations", () => {
  const combined = highlight("grammar Expr;");
  const lexer = highlight("lexer grammar ExprLexer;");

  expect(combined).toContain('<span class="hljs-keyword">grammar</span>');
  expect(combined).toContain('<span class="hljs-title class_">Expr</span>');
  expect(lexer).toContain(
    '<span class="hljs-keyword">lexer</span> <span class="hljs-keyword">grammar</span> <span class="hljs-title class_">ExprLexer</span>',
  );
});

test("antlr styles parser and lexer rule definitions differently", () => {
  const result = highlight("stat\n    : ID '=' INT ;\nID : [a-z]+ ;");

  expect(result).toContain('<span class="hljs-title function_">stat</span>');
  expect(result).toContain('<span class="hljs-title class_">ID</span>');
  // References inside a rule body are not definitions.
  expect(result).not.toContain('<span class="hljs-title class_">INT</span>');
});

test("antlr highlights fragments, literals, char sets, and ranges", () => {
  const result = highlight("fragment DIGIT : '0'..'9' | ~[\\r\\n] ;");

  expect(result).toContain('<span class="hljs-keyword">fragment</span>');
  expect(result).toContain('<span class="hljs-title class_">DIGIT</span>');
  expect(result).toContain('<span class="hljs-string">&#x27;0&#x27;</span>');
  expect(result).toContain('<span class="hljs-operator">..</span>');
  expect(result).toContain('<span class="hljs-operator">~</span>');
  expect(result).toContain('<span class="hljs-regexp">[\\r\\n]</span>');
});

test("antlr highlights lexer commands and mode declarations", () => {
  const result = highlight(
    "WS : [ \\t]+ -> skip ;\nCOMMENT : '//' ~[\\n]* -> channel(HIDDEN) ;\nmode IN_STRING;",
  );

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
  expect(result).toContain('<span class="hljs-built_in">skip</span>');
  expect(result).toContain('<span class="hljs-built_in">channel</span>');
  expect(result).toContain('<span class="hljs-literal">HIDDEN</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">mode</span> <span class="hljs-title">IN_STRING</span>',
  );
});

test("antlr highlights labels and alternative labels", () => {
  const result = highlight(
    "expr\n    : left=expr '*' right=expr  # Mul\n    | args+=expr  # List\n    ;",
  );

  expect(result).toContain('<span class="hljs-variable">left</span>');
  expect(result).toContain('<span class="hljs-operator">=</span>');
  expect(result).toContain('<span class="hljs-operator">+=</span>');
  expect(result).toContain('<span class="hljs-symbol"># Mul</span>');
});

test("antlr balances braces in named actions", () => {
  const result = highlight(
    '@members {\n  void f() { if (x) { y(); } }\n  String s = "}";\n}\nprog : EOF ;',
  );

  expect(result).toContain('<span class="hljs-meta">@members</span>');
  // The rule after the action is still recognized, so the action closed
  // at its own brace, not at a nested one or the one in the string.
  expect(result).toContain('<span class="hljs-title function_">prog</span>');
  expect(result).toContain('<span class="hljs-built_in">EOF</span>');
});

test("antlr highlights options, tokens, and rule signatures", () => {
  const result = highlight(
    "options { tokenVocab = ExprLexer; }\ntokens { INDENT }\nexpr[int p] returns [int v] : INT ;",
  );

  expect(result).toContain('<span class="hljs-keyword">options</span>');
  expect(result).toContain('<span class="hljs-attr">tokenVocab</span>');
  expect(result).toContain('<span class="hljs-keyword">tokens</span>');
  expect(result).toContain('<span class="hljs-title function_">expr</span>');
  expect(result).toContain('<span class="hljs-keyword">returns</span>');
  // `[int v]` is a declaration, not a character set.
  expect(result).not.toContain('<span class="hljs-regexp">[int v]</span>');
});
