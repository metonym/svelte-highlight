import { createRegistry } from "../src/engine.js";

import textproto from "../src/languages/textproto";

const registry = createRegistry();

registry.register(textproto.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "textproto" }).value;

test("textproto highlights field names as attrs", () => {
  const result = highlight('name: "Alice"');

  expect(result).toContain('<span class="hljs-attr">name</span>');
});

test("textproto highlights extension fields with high relevance", () => {
  const result = highlight('[com.example.ext.special_field]: "extended"');

  expect(result).toContain(
    '<span class="hljs-meta">[com.example.ext.special_field]</span>',
  );
});

test("textproto highlights header comments", () => {
  const result = highlight("# proto-file: example.proto");

  expect(result).toContain(
    '<span class="hljs-meta"># proto-file: example.proto</span>',
  );
});

test("textproto highlights numbers including special forms", () => {
  const result = highlight("age: 30\nratio: 1.5e3\nbad: nan");

  expect(result).toContain('<span class="hljs-number">30</span>');
  expect(result).toContain('<span class="hljs-number">1.5e3</span>');
  expect(result).toContain('<span class="hljs-number">nan</span>');
});

test("textproto highlights bare enum-like values as literals", () => {
  const result = highlight("status: ACTIVE");

  expect(result).toContain('<span class="hljs-literal">ACTIVE</span>');
});

test("textproto highlights message blocks and plain comments", () => {
  const result = highlight('# a comment\naddress {\n  city: "Springfield"\n}');

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain('<span class="hljs-attr">address</span>');
});
