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

test("plsql highlights qualified calls to supplied packages", () => {
  const result = highlight(
    "DBMS_OUTPUT.PUT_LINE('done'); UTL_FILE.FCLOSE(f); my_pkg.run(1);",
  );

  expect(result).toContain(
    '<span class="hljs-built_in">DBMS_OUTPUT.PUT_LINE</span>',
  );
  expect(result).toContain(
    '<span class="hljs-built_in">UTL_FILE.FCLOSE</span>',
  );
  // A user package call is a plain identifier.
  expect(result).not.toContain('<span class="hljs-built_in">my_pkg.run</span>');
});

test("plsql highlights conditional compilation and float suffixes", () => {
  const result = highlight(
    "$IF $$debug $THEN NULL; $END\nl_f BINARY_FLOAT := 3.5f; l_d BINARY_DOUBLE := 2.0d; n NUMBER := 10;",
  );

  expect(result).toContain('<span class="hljs-meta">$IF</span>');
  expect(result).toContain('<span class="hljs-meta">$$debug</span>');
  expect(result).toContain('<span class="hljs-meta">$END</span>');
  expect(result).toContain('<span class="hljs-type">BINARY_FLOAT</span>');
  expect(result).toContain('<span class="hljs-number">3.5f</span>');
  expect(result).toContain('<span class="hljs-number">2.0d</span>');
  expect(result).toContain('<span class="hljs-number">10</span>;');
});

test("plsql highlights CONTINUE, GOTO, FORALL options, and trigger timing", () => {
  const result = highlight(
    "CONTINUE WHEN i = 0; GOTO fin; FORALL i IN INDICES OF t SAVE EXCEPTIONS INSERT INTO h VALUES t(i); FUNCTION f RETURN NUMBER PIPELINED IS BEGIN PIPE ROW(1); END;\nCREATE TRIGGER trg BEFORE INSERT ON e FOR EACH ROW BEGIN NULL; END;",
  );

  expect(result).toContain('<span class="hljs-keyword">CONTINUE</span>');
  expect(result).toContain('<span class="hljs-keyword">GOTO</span>');
  expect(result).toContain('<span class="hljs-keyword">INDICES</span>');
  expect(result).toContain('<span class="hljs-keyword">SAVE EXCEPTIONS</span>');
  expect(result).toContain('<span class="hljs-keyword">PIPELINED</span>');
  expect(result).toContain('<span class="hljs-keyword">PIPE</span>');
  expect(result).toContain('<span class="hljs-keyword">BEFORE</span>');
  expect(result).toContain('<span class="hljs-keyword">FOR EACH ROW</span>');
});
