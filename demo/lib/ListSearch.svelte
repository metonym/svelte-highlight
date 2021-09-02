<script>
  /** @type {{ name: string; moduleName: string; }[]} */
  export let items = [];

  export let filtered = [];

  /** @type {"language" | "style"} */
  export let itemName = "";

  export let labelA = "Base import";

  export let labelB = "Direct import";

  export let currentLabel = labelB;

  export let placeholderExample = "JavaScript";

  import {
    Row,
    Column,
    Search,
    RadioButton,
    RadioButtonGroup,
  } from "carbon-components-svelte";

  const VERSION_HLJS = process.env.VERSION_HLJS;

  let value = "";

  $: normalizedValue = value.trim().toLowerCase();
  $: filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedValue) ||
      item.moduleName.toLowerCase().includes(normalizedValue)
  );
</script>

<Row>
  <Column>
    <p>
      {items.length}
      {itemName}s exported from <code class="code">highlight.js</code> version {VERSION_HLJS}
    </p>
  </Column>
</Row>

<Row>
  <Column noGutter>
    <Search
      size="lg"
      bind:value
      placeholder="{`Filter ${itemName}s (e.g., "${placeholderExample}")`}"
    />
  </Column>
</Row>

<Row>
  <Column>
    <RadioButtonGroup legendText="Import method" bind:selected="{currentLabel}">
      <RadioButton labelText="{labelB}" value="{labelB}" />
      <RadioButton labelText="{labelA}" value="{labelA}" />
    </RadioButtonGroup>
  </Column>
</Row>

<slot />

{#if filtered.length === 0}
  <Row>
    <Column>
      <p>
        No matches found for "{value}"
      </p>
    </Column>
  </Row>
{/if}
