import { createRegistry } from "../src/engine.js";

import casbin from "../src/languages/casbin";

const registry = createRegistry();

registry.register(casbin.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "casbin" }).value;

test("casbin highlights known section headers", () => {
  const result = highlight("[matchers]\nm = r.sub == p.sub");

  expect(result).toContain('<span class="hljs-section">[matchers]</span>');
});

test("casbin highlights built-in matcher functions and literals", () => {
  const result = highlight(
    "[matchers]\nm = keyMatch2(r.obj, p.obj) && p.eft == allow",
  );

  expect(result).toContain('<span class="hljs-built_in">keyMatch2</span>');
  expect(result).toContain('<span class="hljs-literal">allow</span>');
});

test("casbin highlights field references on request and policy variables", () => {
  const result = highlight("[matchers]\nm = r.sub == p.sub");

  expect(result).toContain('<span class="hljs-variable">r.sub</span>');
  expect(result).toContain('<span class="hljs-variable">p.sub</span>');
});

test("casbin highlights logical and comparison operators", () => {
  const result = highlight("[matchers]\nm = r.sub == p.sub && r.obj == p.obj");

  expect(result).toContain('<span class="hljs-operator">==</span>');
  expect(result).toContain('<span class="hljs-operator">&amp;&amp;</span>');
});

test("casbin highlights comments and definition-line names", () => {
  const result = highlight(
    "# a comment\n[request_definition]\nr = sub, obj, act",
  );

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain(
    '<span class="hljs-section">[request_definition]</span>',
  );
  expect(result).toContain('<span class="hljs-attr">r</span>');
});

test("casbin does not style a generic INI section or plain field names as built-ins", () => {
  const result = highlight("[general]\nkey = value");

  expect(result).not.toContain('<span class="hljs-section">[general]</span>');

  const requestLine = highlight("[request_definition]\nr = sub, obj, act");
  expect(requestLine).not.toContain('<span class="hljs-built_in">sub</span>');
});
