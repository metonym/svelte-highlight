import { createRegistry } from "../src/engine.js";

import plsql from "../src/languages/plsql";

const registry = createRegistry();

registry.register(plsql.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "plsql" }).value;

test("plsql highlights PL/SQL specific keywords", () => {
  const result = highlight("DECLARE\nBEGIN\nEND;");

  expect(result).toContain('<span class="hljs-keyword">DECLARE</span>');
  expect(result).toContain('<span class="hljs-keyword">BEGIN</span>');
});

test("plsql highlights multi-word keywords", () => {
  const result = highlight("CREATE OR REPLACE PROCEDURE foo IS");

  expect(result).toContain(
    '<span class="hljs-keyword">CREATE OR REPLACE</span>',
  );
});

test("plsql highlights %TYPE with high relevance", () => {
  const result = highlight("v_salary employees.salary%TYPE;");

  expect(result).toContain('<span class="hljs-built_in">%TYPE</span>');
});

test("plsql highlights assignment operator and bind variables", () => {
  const result = highlight("v_salary := :bind_value;");

  expect(result).toContain('<span class="hljs-operator">:=</span>');
  expect(result).toContain('<span class="hljs-variable">:bind_value</span>');
});

test("plsql highlights quoted strings and labels", () => {
  const result = highlight("q'[it's fine]'\n<<my_label>>");

  expect(result).toContain(
    '<span class="hljs-string">q&#x27;[it&#x27;s fine]&#x27;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-symbol">&lt;&lt;my_label&gt;&gt;</span>',
  );
});

test("plsql highlights the standalone slash terminator", () => {
  const result = highlight("END;\n/");

  expect(result).toContain('<span class="hljs-meta">/</span>');
});
