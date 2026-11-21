import { createRegistry, registerAll } from "../src/engine.js";

import freemarker from "../src/languages/freemarker";

const registry = createRegistry();

registerAll(registry, freemarker);

const highlight = (code: string) =>
  registry.highlight(code, { language: "freemarker" }).value;

test("freemarker highlights directives and leaves the markup to xml", () => {
  const result = highlight("<#list items as item><li>${item}</li></#list>");

  expect(result).toContain(
    '<span class="hljs-template-tag">&lt;#<span class="hljs-keyword">list</span> items <span class="hljs-keyword">as</span> item&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-tag">&lt;/#<span class="hljs-keyword">list</span>&gt;</span>',
  );
  expect(result).toContain('<span class="hljs-name">li</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">${item}</span>',
  );
});

test("freemarker keeps a > inside parentheses from closing the tag", () => {
  const result = highlight("<#if (count > 0)>many<#else>none</#if>");

  expect(result).toContain(
    '<span class="hljs-template-tag">&lt;#<span class="hljs-keyword">if</span> (count &gt; <span class="hljs-number">0</span>)&gt;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-tag">&lt;#<span class="hljs-keyword">else</span>&gt;</span>',
  );
});

test("freemarker highlights built-ins and the default operator", () => {
  const result = highlight(
    '${name!"guest"} ${list?has_content} ${x??} ${price?string.currency}',
  );

  expect(result).toContain(
    'name<span class="hljs-operator">!</span><span class="hljs-string">&quot;guest&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-operator">?</span><span class="hljs-built_in">has_content</span>',
  );
  expect(result).toContain('x<span class="hljs-operator">??</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">string</span>.currency}',
  );
});

test("freemarker tells special variables from member access", () => {
  const result = highlight("${.now?date} ${user.name} ${(a.b).c}");

  expect(result).toContain('<span class="hljs-variable language_">.now</span>');
  expect(result).toContain("${user.name}");
  expect(result).not.toContain(
    '<span class="hljs-variable language_">.name</span>',
  );
  expect(result).not.toContain(
    '<span class="hljs-variable language_">.c</span>',
  );
});

test("freemarker highlights macros and user-defined directives", () => {
  const result = highlight(
    '<#macro card title>${title}</#macro><@card title="Hi"/><@layout.page>x</@layout.page>',
  );

  expect(result).toContain(
    '<span class="hljs-keyword">macro</span> <span class="hljs-title function_">card</span>',
  );
  expect(result).toContain(
    '&lt;@<span class="hljs-title function_">card</span> <span class="hljs-attr">title</span>=<span class="hljs-string">&quot;Hi&quot;</span>/&gt;',
  );
  expect(result).toContain(
    '&lt;/@<span class="hljs-title function_">layout.page</span>&gt;',
  );
});

test("freemarker highlights comments and the square-bracket syntax", () => {
  const result = highlight("<#-- note -->[#-- also --][#if ok]yes[/#if]");

  expect(result).toContain(
    '<span class="hljs-comment">&lt;#-- note --&gt;</span>',
  );
  expect(result).toContain('<span class="hljs-comment">[#-- also --]</span>');
  expect(result).toContain(
    '<span class="hljs-template-tag">[#<span class="hljs-keyword">if</span> ok]</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-tag">[/#<span class="hljs-keyword">if</span>]</span>',
  );
});

test("freemarker interpolates inside strings but not raw strings", () => {
  const result = highlight('<#assign a = "Hi ${name}" b = r"${raw}">');

  expect(result).toContain(
    '<span class="hljs-string">&quot;Hi <span class="hljs-subst">${name}</span>&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">r&quot;${raw}&quot;</span>',
  );
});

test("freemarker leaves noparse bodies and stray <# alone", () => {
  const result = highlight(
    "<#noparse>${not.parsed}</#noparse><p>a <#b</p>#{n; m2}",
  );

  expect(result).not.toContain(
    '<span class="hljs-template-variable">${not.parsed}</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-tag">&lt;/#<span class="hljs-keyword">noparse</span>&gt;</span>',
  );
  expect(result).not.toContain('<span class="hljs-keyword">b</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">#{n; m2}</span>',
  );
});
