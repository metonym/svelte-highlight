<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Select, SelectItem } from "carbon-components-svelte";
  import { onMount } from "svelte";
  import Highlight from "svelte-highlight";
  import xml from "svelte-highlight/languages/xml";

  const snippet = `<shl-code language="rust">fn main() { println!("hi"); }</shl-code>

<script type="module">
  import { defineHighlightElement } from "svelte-highlight/element";

  defineHighlightElement();
<\/script>`;

  /** @type {Record<string, string>} */
  const samples = {
    rust: 'fn main() {\n    let name = "world";\n    println!("hello, {name}");\n}',
    go: 'func main() {\n\tname := "world"\n\tfmt.Printf("hello, %s\\n", name)\n}',
    python: 'def main():\n    name = "world"\n    print(f"hello, {name}")',
  };

  let language = "rust";
  let defined = false;
  /** @type {HTMLElement & { code: string } | undefined} */
  let element;

  // Set as a property: the element's text is parsed as HTML.
  $: if (element) element.code = samples[language] ?? "";

  onMount(async () => {
    const { defineHighlightElement } = await import("svelte-highlight/element");
    defineHighlightElement();
    defined = true;
  });
</script>

<Highlight language={xml} code={snippet} class={THEME_MODULE_NAME} />

<!-- The docs scope their theme to a class. -->
<div class="demo {THEME_MODULE_NAME}">
  <Select size="sm" labelText="language attribute" bind:selected={language}>
    {#each Object.keys(samples) as name}
      <SelectItem value={name} />
    {/each}
  </Select>
  {#if defined}
    <shl-code bind:this={element} {language}></shl-code>
  {/if}
</div>

<style>
  .demo {
    margin-top: var(--cds-spacing-05);
    max-width: 32rem;
  }

  .demo :global(shl-code pre) {
    margin-top: var(--cds-spacing-05);
  }

  /* The docs' theme puts block layout on \`pre.<theme> code.hljs\`. */
  .demo :global(pre code.hljs) {
    display: block;
    overflow-x: auto;
    padding: 1em;
  }
</style>
