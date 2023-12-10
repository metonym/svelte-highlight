<script>
  // @ts-check
  import { PKG_HLJS_VERSION } from "@www/constants";

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

  /** @type {null | HTMLInputElement} */
  let ref = null;
  let value = "";
  let currentLabel = labelB;

  /** @type {(s: string) => string} */
  const normalize = (s) =>
    s.toLowerCase().replace(/\-/g, " ").replace(/\s+/g, " ");

  $: normalizedValue = normalize(value.trim());
  $: normalizedItems = items.map((item) => ({
    ...item,
    normalized_name: normalize(item.name),
    normalized_moduleName: item.moduleName.toLowerCase(),
  }));
  $: filtered = normalizedItems.filter(
    (item) =>
      item.normalized_name.includes(normalizedValue) ||
      item.normalized_moduleName.includes(normalizedValue)
  );
  $: filteredIds = new Set(filtered.map((item) => item.name));
</script>

<FocusKey element={ref} selectText />

<Row>
  <Column>
    <p class="text-02">
      {items.length}
      {itemName}s from highlight.js v{PKG_HLJS_VERSION}.
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

<slot {filteredIds} {currentLabel} />

{#if filtered.length === 0}
  <Row>
    <Column>
      <p>
        No matches found for "{value}"
      </p>
    </Column>
  </Row>
{/if}
