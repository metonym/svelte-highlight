import html from "svelte-highlight/languages/html";
import { createRegistry, registerAll } from "../src/engine.js";
import vue from "../src/languages/vue";

const registry = createRegistry();

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

const customDirectiveSnippet = `<template>
  <input v-focus />
  <div v-tooltip="'Hello'"></div>
</template>`;

test("vue highlights script setup as TypeScript", () => {
  registerAll(registry, vue);

  const result = registry.highlight(scriptSetupSnippet, {
    language: "vue",
  }).value;

  expect(result).toContain("language-typescript");
  expect(result).toContain("hljs-keyword");
  expect(result).toContain("language-html");
});

test("vue highlights template directives and mustache expressions", () => {
  registerAll(registry, vue);

  const result = registry.highlight(templateSnippet, { language: "vue" }).value;

  expect(result).toContain("language-html");
  expect(result).toContain("hljs-tag");
  expect(result).toContain('<span class="hljs-keyword">v-if</span>');
  expect(result).toContain('<span class="hljs-variable">:class</span>');
});

test("vue highlights mustache expressions in templates", () => {
  registerAll(registry, vue);

  const result = registry.highlight(
    "<template><p>{{ message }}</p></template>",
    {
      language: "vue",
    },
  ).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("{{ message }}");
});

test("vue highlights scss style blocks", () => {
  registerAll(registry, vue);

  const result = registry.highlight(styleSnippet, { language: "vue" }).value;

  expect(result).toContain("language-scss");
  expect(result).toContain("hljs-selector-class");
  expect(result).toContain("language-html");
});

test("vue highlights plain JavaScript script blocks", () => {
  registerAll(registry, vue);

  const result = registry.highlight(javascriptSnippet, {
    language: "vue",
  }).value;

  expect(result).toContain("language-javascript");
  expect(result).toContain("hljs-keyword");
});

test("vue highlights custom user-registered directives", () => {
  registerAll(registry, vue);

  const result = registry.highlight(customDirectiveSnippet, {
    language: "vue",
  }).value;

  expect(result).toContain('<span class="hljs-keyword">v-focus</span>');
  expect(result).toContain('<span class="hljs-keyword">v-tooltip</span>');
});

test("vue highlights longhand directives with an explicit argument", () => {
  registerAll(registry, vue);

  const result = registry.highlight(
    `<template>
  <a v-bind:href="url" v-on:click="handler">
    <slot v-slot:name></slot>
  </a>
</template>`,
    { language: "vue" },
  ).value;

  expect(result).toContain('<span class="hljs-keyword">v-bind:href</span>');
  expect(result).toContain('<span class="hljs-keyword">v-on:click</span>');
  expect(result).toContain('<span class="hljs-keyword">v-slot:name</span>');
});

test("html alone does not highlight vue directives or mustache expressions", () => {
  const isolated = createRegistry();
  registerAll(isolated, html);

  const result = isolated.highlight(templateSnippet, {
    language: "html",
  }).value;

  expect(result).not.toContain('<span class="hljs-keyword">v-if</span>');
  expect(result).not.toContain("language-javascript");
});
