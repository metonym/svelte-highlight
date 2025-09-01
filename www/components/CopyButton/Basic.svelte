<script lang="ts">
  import { Highlight, CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = `function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);`;
</script>

<div class="highlight-wrapper">
  <Highlight language={typescript} {code} class="github">
    <CopyButton {code} />
  </Highlight>
</div>

<style>
  .highlight-wrapper {
    position: relative;
  }

  :global(.github) {
    margin: 0;
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
