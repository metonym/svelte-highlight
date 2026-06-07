import hljs from "highlight.js/lib/core";
import html from "svelte-highlight/languages/html";
import vue from "../src/languages/vue";

const scriptSetupSnippet = `<script setup lang="ts">
const count = ref(0);
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>`;

const templateSnippet = `<template>
  <div v-if="visible" :class="{ active: isActive }">
    <slot name="header" />
  </div>
</template>`;

const styleSnippet = `<style scoped lang="scss">
.card {
  color: red;
}
</style>

<p>Hi</p>`;

const javascriptSnippet = `<script>
export default {
  data() {
    return { count: 0 };
  },
};
</script>`;

test("vue highlights script setup as TypeScript", () => {
  hljs.registerLanguage(vue.name, vue.register);

  const result = hljs.highlight(scriptSetupSnippet, {
    language: "vue",
  }).value;

  expect(result).toContain("language-typescript");
  expect(result).toContain("hljs-keyword");
  expect(result).toContain("language-html");
});

test("vue highlights template directives and mustache expressions", () => {
  hljs.registerLanguage(vue.name, vue.register);

  const result = hljs.highlight(templateSnippet, { language: "vue" }).value;

  expect(result).toContain("language-html");
  expect(result).toContain("hljs-tag");
  expect(result).toContain('<span class="hljs-keyword">v-if</span>');
  expect(result).toContain('<span class="hljs-variable">:class</span>');
});

test("vue highlights mustache expressions in templates", () => {
  hljs.registerLanguage(vue.name, vue.register);

  const result = hljs.highlight("<template><p>{{ message }}</p></template>", {
    language: "vue",
  }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("{{ message }}");
});

test("vue highlights scss style blocks", () => {
  hljs.registerLanguage(vue.name, vue.register);

  const result = hljs.highlight(styleSnippet, { language: "vue" }).value;

  expect(result).toContain("language-scss");
  expect(result).toContain("hljs-selector-class");
  expect(result).toContain("language-html");
});

test("vue highlights plain JavaScript script blocks", () => {
  hljs.registerLanguage(vue.name, vue.register);

  const result = hljs.highlight(javascriptSnippet, { language: "vue" }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-keyword");
});

test("html alone does not highlight vue directives or mustache expressions", () => {
  const isolated = hljs.newInstance();
  isolated.registerLanguage(html.name, html.register);

  const result = isolated.highlight(templateSnippet, {
    language: "html",
  }).value;

  expect(result).not.toContain('<span class="hljs-keyword">v-if</span>');
  expect(result).not.toContain("language-javascript");
});
