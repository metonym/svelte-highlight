export const vueKitchenSink = `<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

type Item = { id: number; label: string };

interface Props {
  title: string;
  items?: Item[];
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const emit = defineEmits<{
  submit: [value: string];
  update: [count: number];
}>();

const count = ref(0);
const name = ref("");
const visible = ref(true);
const isActive = ref(false);

const doubled = computed(() => count.value * 2);
const greeting = computed(() => \`Hello, \${name.value || "Anonymous"}!\`);

watch(count, (value) => {
  emit("update", value);
});

function increment() {
  count.value += 1;
}

function submit() {
  emit("submit", name.value);
}

onMounted(() => {
  console.log("mounted", props.title);
});
</script>

<template>
  <!-- Template directives and mustache expressions -->
  <header v-if="visible">
    <h1>{{ title }}</h1>
    <p>{{ greeting }} · {{ doubled }} clicks</p>
  </header>

  <div
    v-show="visible"
    :class="{ active: isActive, card: true }"
    :style="{ opacity: count / 10 }"
  >
    <input v-model="name" placeholder="Name" @keyup.enter="submit" />
    <button @click="increment" @keydown.enter="increment">+1</button>
    <button v-on:click="isActive = !isActive">Toggle</button>
  </div>

  <ul v-if="items.length">
    <li v-for="item in items" :key="item.id" v-memo="[item.id]">
      {{ item.label }}
    </li>
  </ul>
  <p v-else>No items</p>

  <Child v-slot="{ message }">
    <span>{{ message }}</span>
  </Child>

  <template #footer>
    <small>Built with Vue</small>
  </template>
</template>

<style scoped lang="scss">
$brand: #42b883;

.card {
  padding: 1rem;
  border: 1px solid #ccc;

  &.active {
    border-color: $brand;
  }
}

:deep(.nested) {
  margin: 0;
}
</style>

<style scoped lang="less">
@muted: #666;

small {
  color: @muted;
}
</style>`;
