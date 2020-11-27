<script lang="ts">
  import { Highlight, HighlightLite, HighlightSvelte, HighlightSvelteFormatted } from "../types";

  let highlighted = "";
</script>

<Highlight
  style="color: blue"
  class="my-class"
  on:highlight="{(e) => {
    console.log(e.detail);
  }}"
  let:highlight
  bind:highlighted
  code=""
/>

<HighlightLite bind:highlighted code="" />

<HighlightSvelte
  typescript
  style="color: blue"
  class="my-class"
  on:highlight="{(e) => {
    console.log(e.detail);
  }}"
  let:highlight
  bind:highlighted
  code=""
/>

<HighlightSvelteFormatted
  typescript
  style="color: blue"
  class="my-class"
  on:highlight="{(e) => {
    console.log(e.detail);
  }}"
  let:highlight
  bind:highlighted
  code=""
  prettier="{{ svelteStrictMode: true }}"
/>
