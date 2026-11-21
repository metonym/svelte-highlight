import { createRegistry, registerAll } from "../src/engine.js";

import yacc from "../src/languages/yacc";

const registry = createRegistry();

registerAll(registry, yacc);

const highlight = (code: string) =>
  registry.highlight(code, { language: "yacc" }).value;

test("yacc highlights declarations and type tags", () => {
  const result = highlight("%token <num> NUMBER\n%left '+' '-'\n%start input");

  expect(result).toContain('<span class="hljs-keyword">%token</span>');
  expect(result).toContain('<span class="hljs-type">&lt;num&gt;</span>');
  expect(result).toContain('<span class="hljs-keyword">%left</span>');
  expect(result).toContain('<span class="hljs-string">&#x27;+&#x27;</span>');
  expect(result).toContain('<span class="hljs-keyword">%start</span>');
});

test("yacc styles the name after %define and %code", () => {
  const define = highlight("%define parse.error verbose");
  const code = highlight("%code requires {\n  #include <stdio.h>\n}");

  expect(define).toContain('<span class="hljs-attr">parse.error</span>');
  expect(code).toContain(
    '<span class="hljs-keyword">%code</span> <span class="hljs-keyword">requires</span>',
  );
});

test("yacc embeds C in the prologue and the epilogue", () => {
  const result = highlight(
    "%{\n#include <stdio.h>\n%}\n%%\nx: 'a' ;\n%%\nint main(void) { return 0; }",
  );

  expect(result).toContain('<span class="hljs-meta">%{</span>');
  expect(result).toContain('<span class="hljs-meta">%}</span>');
  expect(result.match(/class="language-c"/g)?.length).toBeGreaterThanOrEqual(2);
  expect(result).toContain('<span class="hljs-keyword">return</span>');
});

test("yacc highlights rule names, alternatives, and terminators", () => {
  const result = highlight("%%\nexpr\n    : expr '+' term\n    | term\n    ;");

  expect(result).toContain('<span class="hljs-title function_">expr</span>');
  expect(result).toContain('<span class="hljs-operator">|</span>');
  expect(result).toContain('<span class="hljs-punctuation">;</span>');
  // Symbols on the right side are references, not rule names.
  expect(result).not.toContain(
    '<span class="hljs-title function_">term</span>',
  );
});

test("yacc highlights semantic values inside C actions", () => {
  const result = highlight(
    "%%\nexpr: expr '+' expr { $$ = $1 + $3; @$ = @1; } ;",
  );

  expect(result).toContain('<span class="hljs-variable">$$</span>');
  expect(result).toContain('<span class="hljs-variable">$1</span>');
  expect(result).toContain('<span class="hljs-variable">@$</span>');
  expect(result).toContain('<span class="hljs-variable">@1</span>');
  expect(result).toContain('class="language-c"');
});

test("yacc keeps nested braces inside one action", () => {
  const result = highlight(
    "%%\nstmt: IF expr { if ($2) { run(); } else { skip(); } } ;\nnext: ID ;",
  );

  // The rule after the action still starts a new rule.
  expect(result).toContain('<span class="hljs-title function_">next</span>');
});

test("yacc highlights %prec and %empty inside rules", () => {
  const result = highlight(
    "%%\nexpr: '-' expr %prec UMINUS { $$ = -$2; }\n    | %empty\n    ;",
  );

  expect(result).toContain('<span class="hljs-keyword">%prec</span>');
  expect(result).toContain('<span class="hljs-keyword">%empty</span>');
});

test("yacc only splits sections on a %% line", () => {
  const result = highlight("%token A\n%%  \nr: A ;");
  const comment = highlight("%token A\n%% not a section\n");

  expect(result).toContain('<span class="hljs-meta">%%</span>');
  expect(comment).not.toContain('<span class="hljs-meta">%%</span>');
});

test("yacc highlights comments", () => {
  const result = highlight("/* tokens */\n%token NUM // a number");

  expect(result).toContain('<span class="hljs-comment">/* tokens */</span>');
  expect(result).toContain('<span class="hljs-comment">// a number</span>');
});

test("yacc highlights parser macros inside actions", () => {
  const result = highlight("%%\nline: error '\\n' { yyerrok; YYABORT; } ;");

  expect(result).toContain('<span class="hljs-built_in">yyerrok</span>');
  expect(result).toContain('<span class="hljs-built_in">YYABORT</span>');
});
