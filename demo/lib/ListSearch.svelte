<script>
  // @ts-check
  /** @type {{ name: string; moduleName: string; }[]} */
  export let items = [];

  /** @type {"language" | "style"} */
  export let itemName;

  export let labelA = "Base import";

  export let labelB = "Direct import";

  export let placeholderExample = "JavaScript";

  import {
    Row,
    Column,
    Search,
    RadioButton,
    RadioButtonGroup,
  } from "carbon-components-svelte";
  import FocusKey from "svelte-focus-key";

  const VERSION_HLJS = process.env.VERSION_HLJS;

  let ref = null;
  let value = "";
  let currentLabel = labelB;

  /** @type {(s: string) => string} */
  const normalize = (s) =>
    s.toLowerCase().replace(/\-/g, " ").replace(/\s+/g, " ");

  $: normalizedValue = normalize(value.trim());
  $: filtered = items.filter(
    (item) =>
      normalize(item.name).includes(normalizedValue) ||
      item.moduleName.toLowerCase().includes(normalizedValue)
  );
</script>

<FocusKey element={ref} selectText />

<Row>
  <Column>
    <p>
      {items.length}
      {itemName}s exported from <code class="code">highlight.js</code> version {VERSION_HLJS}
    </p>
  </Column>
</Row>

<Row>
  <Column>
    <Search
      bind:ref
      bind:value
      spellcheck="false"
      placeholder={`Search ${itemName}s (e.g., "${placeholderExample}")`}
    />
  </Column>
</Row>

<Row>
  <Column>
    <RadioButtonGroup legendText="Import method" bind:selected={currentLabel}>
      <RadioButton labelText={labelB} value={labelB} />
      <RadioButton labelText={labelA} value={labelA} />
    </RadioButtonGroup>
  </Column>
</Row>

<slot {filtered} {currentLabel} />

{#if filtered.length === 0}
  <Row>
    <Column>
      <p>
        No matches found for "{value}"
      </p>
    </Column>
  </Row>
{/if}
