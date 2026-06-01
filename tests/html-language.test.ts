import hljs from "highlight.js/lib/core";
import xml from "svelte-highlight/languages/xml";
import html from "../src/languages/html";

const styleScriptSnippet = `<style>.content { display: flex; }</style>
<script>const x = 1;</script>`;

const markupSnippet = `<!DOCTYPE html>
<!-- comment -->
<div id="main" class='page'>Hello &amp; world</div>`;

test("html highlights embedded CSS and JavaScript", () => {
  hljs.registerLanguage(html.name, html.register);

  const result = hljs.highlight(styleScriptSnippet, { language: "html" }).value;

  expect(result).toContain("language-css");
  expect(result).toContain("hljs-selector-class");
  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-keyword");
});

test("html highlights basic markup", () => {
  hljs.registerLanguage(html.name, html.register);

  const result = hljs.highlight(markupSnippet, { language: "html" }).value;

  expect(result).toContain("hljs-meta");
  expect(result).toContain("hljs-comment");
  expect(result).toContain("hljs-tag");
  expect(result).toContain("hljs-attr");
  expect(result).toContain("hljs-string");
  expect(result).toContain("hljs-symbol");
});

test("xml alone does not highlight embedded CSS and JavaScript", () => {
  const isolated = hljs.newInstance();
  isolated.registerLanguage(xml.name, xml.register);

  const result = isolated.highlight(styleScriptSnippet, {
    language: "xml",
  }).value;

  expect(result).not.toContain("language-css");
  expect(result).not.toContain("language-javascript");
});
