import { createRegistry, registerAll } from "../src/engine.js";

import httpfile from "../src/languages/httpfile";

const registry = createRegistry();

registerAll(registry, httpfile);

const highlight = (code: string) =>
  registry.highlight(code, { language: "httpfile" }).value;

test("httpfile highlights ### separators with their titles", () => {
  const result = highlight("### Create a user\nGET https://example.com");

  expect(result).toContain(
    '<span class="hljs-section">### Create a user</span>',
  );
});

test("httpfile highlights the request line", () => {
  const result = highlight("POST https://example.com/users HTTP/1.1");

  expect(result).toContain('<span class="hljs-keyword">POST</span>');
  expect(result).toContain(
    '<span class="hljs-string">https://example.com/users</span>',
  );
  expect(result).toContain('<span class="hljs-meta">HTTP/1.1</span>');
});

test("httpfile highlights file variables and interpolation", () => {
  const result = highlight(
    "@host = api.example.com\nGET https://{{host}}/items/{{$guid}}",
  );

  expect(result).toContain('<span class="hljs-variable">@host</span>');
  expect(result).toContain('<span class="hljs-operator">=</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">{{host}}</span>',
  );
  expect(result).toContain(
    '<span class="hljs-template-variable">{{<span class="hljs-built_in">$guid</span>}}</span>',
  );
});

test("httpfile highlights request-variable references in headers", () => {
  const result = highlight(
    "GET https://example.com/me\nAuthorization: Bearer {{login.response.body.$.token}}",
  );

  expect(result).toContain('<span class="hljs-attribute">Authorization</span>');
  expect(result).toContain('<span class="hljs-punctuation">:</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">{{login.response.body.$.token}}</span>',
  );
});

test("httpfile highlights directive comments apart from plain comments", () => {
  const result = highlight(
    "# @name login\n// @no-redirect\n# just a note\nGET https://example.com",
  );

  expect(result).toContain('<span class="hljs-meta">@name</span>');
  expect(result).toContain('<span class="hljs-meta">@no-redirect</span>');
  expect(result).toContain('<span class="hljs-comment"># just a note</span>');
});

test("httpfile embeds JavaScript in response handlers", () => {
  const result = highlight(
    'GET https://example.com\n\n> {%\n  client.test("ok", () => {});\n%}',
  );

  expect(result).toContain('<span class="hljs-meta">&gt; {%</span>');
  expect(result).toContain('<span class="language-javascript">');
  expect(result).toContain('<span class="hljs-title function_">test</span>');
  expect(result).toContain('<span class="hljs-meta">%}</span>');
});

test("httpfile highlights input files and output redirects", () => {
  const result = highlight(
    "POST https://example.com/upload\n\n< ./body.json\n>> ./out.json",
  );

  expect(result).toContain('<span class="hljs-operator">&lt;</span>');
  expect(result).toContain('<span class="hljs-string">./body.json</span>');
  expect(result).toContain('<span class="hljs-operator">&gt;&gt;</span>');
  expect(result).toContain('<span class="hljs-string">./out.json</span>');
});

test("httpfile keeps interpolation visible inside JSON bodies", () => {
  const result = highlight(
    'POST https://example.com\n\n{\n  "id": "{{userId}}",\n  "active": true\n}',
  );

  expect(result).toContain('<span class="hljs-attr">&quot;id&quot;</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;<span class="hljs-template-variable">{{userId}}</span>&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-literal">true</span>');
});

test("httpfile does not treat a URL fragment as a comment", () => {
  const result = highlight("GET https://example.com/docs#section");

  expect(result).toContain(
    '<span class="hljs-string">https://example.com/docs#section</span>',
  );
  expect(result).not.toContain("hljs-comment");
});

test("httpfile reads a method-less {{baseUrl}}/path line as a URL", () => {
  const url = highlight("{{baseUrl}}/health");
  const body = highlight("POST https://example.com\n\n{{payload}}");

  expect(url).toContain(
    '<span class="hljs-string"><span class="hljs-template-variable">{{baseUrl}}</span>/health</span>',
  );
  expect(body).toContain(
    '\n<span class="hljs-template-variable">{{payload}}</span>',
  );
});
