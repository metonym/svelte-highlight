import { createRegistry } from "../src/engine.js";

import meson from "../src/languages/meson";

const registry = createRegistry();

registry.register(meson.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "meson" }).value;

test("meson highlights build functions and keyword arguments", () => {
  const result = highlight(
    "project('demo', 'c', version : '1.0')\nexe = executable('demo', 'main.c', install: true)",
  );

  expect(result).toContain('<span class="hljs-built_in">project</span>');
  expect(result).toContain('<span class="hljs-built_in">executable</span>');
  expect(result).toContain('<span class="hljs-attr">version</span> :');
  expect(result).toContain('<span class="hljs-attr">install</span>:');
  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-string">&#x27;1.0&#x27;</span>');
});

test("meson highlights if/elif/else/endif and foreach blocks", () => {
  const result = highlight(
    "if a and not b\nelif c\nelse\nendif\nforeach key, value : opts\n  break\nendforeach",
  );

  for (const word of [
    "if",
    "and",
    "not",
    "elif",
    "else",
    "endif",
    "foreach",
    "break",
    "endforeach",
  ]) {
    expect(result).toContain(`<span class="hljs-keyword">${word}</span>`);
  }
  expect(result).toContain('<span class="hljs-variable">key, value</span>');
  expect(result).not.toContain('<span class="hljs-attr">');
});

test("meson highlights f-strings and format placeholders", () => {
  const result = highlight(
    "msg = f'built @name@'\nver = '@0@.@1@'.format(major, minor)",
  );

  expect(result).toContain(
    '<span class="hljs-string">f&#x27;built <span class="hljs-subst">@name@</span>&#x27;</span>',
  );
  expect(result).toContain('<span class="hljs-subst">@0@</span>');
  expect(result).toContain(
    '<span class="hljs-title function_ invoke__">format</span>',
  );
});

test("meson keeps triple-quoted strings on one token across lines", () => {
  const result = highlight("doc = '''line one\nline 'two'\n'''\n# done");

  expect(result).toContain(
    '<span class="hljs-string">&#x27;&#x27;&#x27;line one\nline &#x27;two&#x27;\n&#x27;&#x27;&#x27;</span>',
  );
  expect(result).toContain('<span class="hljs-comment"># done</span>');
});

test("meson highlights built-in objects and method calls", () => {
  const result = highlight(
    "cc = meson.get_compiler('c')\nif host_machine.system() == 'linux'\nendif",
  );

  expect(result).toContain(
    '<span class="hljs-variable language_">meson</span>.<span class="hljs-title function_ invoke__">get_compiler</span>',
  );
  expect(result).toContain(
    '<span class="hljs-variable language_">host_machine</span>',
  );
});

test("meson highlights number bases", () => {
  const result = highlight("x = [42, 0x1F, 0o17, 0b101]");

  for (const n of ["42", "0x1F", "0o17", "0b101"]) {
    expect(result).toContain(`<span class="hljs-number">${n}</span>`);
  }
});

test("meson scores Meson habits for auto-detection", () => {
  const relevance = (code: string) =>
    registry.highlight(code, { language: "meson" }).relevance;

  expect(relevance("project('demo', 'c')")).toBeGreaterThanOrEqual(5);
  expect(relevance("cc = meson.get_compiler('c')")).toBeGreaterThanOrEqual(5);
  expect(relevance("f(required : x)")).toBe(2);
  // A call to a generic name or a tight `key: value` adds nothing.
  expect(relevance("project(name)")).toBe(0);
  expect(relevance("f(required: x)")).toBe(0);
});
