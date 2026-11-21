import { createRegistry, registerAll } from "../src/engine.js";

import lex from "../src/languages/lex";

const registry = createRegistry();

registerAll(registry, lex);

const highlight = (code: string) =>
  registry.highlight(code, { language: "lex" }).value;

test("lex highlights options and start condition declarations", () => {
  const result = highlight(
    '%option noyywrap yylineno\n%option prefix="calc"\n%x COMMENT\n%s QUOTED',
  );

  expect(result).toContain(
    '<span class="hljs-keyword">%option</span> <span class="hljs-attr">noyywrap</span>',
  );
  expect(result).toContain('<span class="hljs-string">&quot;calc&quot;</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">%x</span> <span class="hljs-symbol">COMMENT</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">%s</span> <span class="hljs-symbol">QUOTED</span>',
  );
});

test("lex highlights named definitions", () => {
  const result = highlight("DIGIT    [0-9]\nID       [a-z_][a-z0-9_]*");

  expect(result).toContain('<span class="hljs-variable">DIGIT</span>');
  expect(result).toContain('<span class="hljs-regexp">[0-9]</span>');
  expect(result).toContain('<span class="hljs-variable">ID</span>');
});

test("lex embeds C in %{ %} blocks and the user code section", () => {
  const result = highlight(
    '%{\n#include "y.tab.h"\n%}\n%%\n.  ECHO;\n%%\nint main(void) { return yylex(); }',
  );

  expect(result).toContain('<span class="hljs-meta">%{</span>');
  expect(result).toContain('<span class="hljs-meta">%}</span>');
  expect(result.match(/class="language-c"/g)?.length).toBeGreaterThanOrEqual(2);
});

test("lex splits a rule into a pattern and a C action", () => {
  const result = highlight(
    "%%\n{DIGIT}+  { yylval = atoi(yytext); return NUMBER; }",
  );

  expect(result).toContain(
    '<span class="hljs-regexp"><span class="hljs-variable">{DIGIT}</span>+</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">yylval</span>');
  expect(result).toContain('<span class="hljs-built_in">yytext</span>');
  expect(result).toContain('<span class="hljs-keyword">return</span>');
});

test("lex keeps spaces inside quotes and classes in the pattern", () => {
  const result = highlight('%%\n"a b"  ECHO;\n[ \\t]+  ;');

  expect(result).toContain(
    '<span class="hljs-regexp"><span class="hljs-string">&quot;a b&quot;</span></span>',
  );
  expect(result).toContain('<span class="hljs-regexp">[ \\t]+</span>');
});

test("lex highlights start condition prefixes and BEGIN", () => {
  const result = highlight('%%\n<COMMENT>"*/"  BEGIN(INITIAL);');

  expect(result).toContain('<span class="hljs-symbol">&lt;COMMENT&gt;</span>');
  expect(result).toContain('<span class="hljs-built_in">BEGIN</span>');
  expect(result).toContain('<span class="hljs-built_in">INITIAL</span>');
});

test("lex highlights start condition scopes", () => {
  const result = highlight(
    '%%\n<STRING>{\n  \\"  { BEGIN(INITIAL); }\n  .   { yymore(); }\n}',
  );

  expect(result).toContain(
    '<span class="hljs-symbol">&lt;STRING&gt;</span><span class="hljs-punctuation">{</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">yymore</span>');
  expect(result).toContain('<span class="hljs-punctuation">}</span>');
});

test("lex keeps a multi-line action in one block", () => {
  const result = highlight(
    "%%\n[a-z]+  {\n    if (lookup(yytext)) { return ID; }\n  }\n.  ECHO;",
  );

  // The rule after the block still starts with a pattern.
  expect(result).toContain('<span class="hljs-regexp">.</span>');
  expect(result).toContain('<span class="hljs-built_in">ECHO</span>');
});

test("lex highlights <<EOF>> and the | action", () => {
  const result = highlight(
    '%%\n"+"  |\n"-"  { return yytext[0]; }\n<<EOF>>  { yyterminate(); }',
  );

  expect(result).toContain('<span class="hljs-operator">|</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">&lt;&lt;EOF&gt;&gt;</span>',
  );
});
