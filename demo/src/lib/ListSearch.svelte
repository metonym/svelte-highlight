<script>
  /** @type {{ name: string; moduleName: string; }[]} */
  export let items = [];

  export let filtered = [];

  /** @type {"language" | "style"} */
  export let itemName = "";

  export let labelA = "Base import";

  export let labelB = "Direct import (recommended)";

  export let toggled = true;

  export let placeholderExample = "JavaScript";

  import { Row, Column, Search, Toggle } from "carbon-components-svelte";

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
      {itemName}s exported from highlight.js@10.7
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
    <Toggle
      labelText="Import method"
      size="sm"
      labelA="{labelA}"
      labelB="{labelB}"
      bind:toggled
    />
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
