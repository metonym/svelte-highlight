export type VuePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const vuePreviewSnippets: VuePreviewSnippet[] = [
  {
    title: "Script setup with TypeScript",
    description: '<script setup lang="ts"> with Composition API',
    code: `<script setup lang="ts">
import { ref, computed } from "vue";

const count = ref(0);
const doubled = computed(() => count.value * 2);

function increment() {
  count.value += 1;
}
</script>

<template>
  <button @click="increment">{{ doubled }}</button>
</template>`,
  },
  {
    title: "Options API script block",
    description: "Classic export default with data and methods",
    code: `<script>
export default {
  data() {
    return { count: 0, name: "" };
  },
  methods: {
    increment() {
      this.count += 1;
    },
  },
};
</script>`,
  },
  {
    title: "Template directives",
    description: "v-if, v-for, v-model, @click, :class, and #slot",
    code: `<template>
  <div v-if="visible" :class="{ active: isActive }">
    <input v-model="name" @keyup.enter="submit" />
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.label }}</li>
    </ul>
    <template #header="{ title }">
      <h1>{{ title }}</h1>
    </template>
  </div>
</template>`,
  },
  {
    title: "Longhand directive arguments",
    description: "v-bind:href, v-on:click, and v-slot:name",
    code: `<template>
  <a v-bind:href="url" v-on:click.prevent="track">
    <base-layout>
      <template v-slot:header="{ title }">
        <h1>{{ title }}</h1>
      </template>
    </base-layout>
  </a>
</template>`,
  },
  {
    title: "Scoped SCSS styles",
    description: '<style scoped lang="scss">',
    code: `<style scoped lang="scss">
$primary: #42b883;

.card {
  color: $primary;

  &:hover {
    opacity: 0.9;
  }
}
</style>`,
  },
  {
    title: "Less and Stylus style blocks",
    description: "Alternate style lang attributes",
    code: `<style scoped lang="less">
@brand: #35495e;

.title {
  color: @brand;
}
</style>

<style lang="stylus">
.card
  padding 1rem
</style>`,
  },
  {
    title: "Custom directives",
    description: "User-defined v-* directives, not just the built-in list",
    code: `<script setup>
import { vFocus, vTooltip } from "./directives";
</script>

<template>
  <input v-focus placeholder="Autofocused" />
  <button v-tooltip="'Click me'" v-permission.admin="'edit'">
    Save
  </button>
</template>`,
  },
];
