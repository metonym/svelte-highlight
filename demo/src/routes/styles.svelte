<script>
  import {
    Row,
    Column,
    Search,
    StructuredList,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,
    CodeSnippet,
    Toggle,
  } from "carbon-components-svelte";
  import styles from "$lib/styles.json";
  import ScopedStyle from "$lib/ScopedStyle.svelte";

  let value = "";
  let useInjectedStyles = true;

  $: normalizedValue = value.toLowerCase();
  $: filteredStyles = styles.filter(
    (style) =>
      style.name.toLowerCase().includes(normalizedValue) ||
      style.moduleName.toLowerCase().includes(normalizedValue)
  );
</script>

<Row>
  <Column>
    <p>
      {styles.length} styles exported from highlight.js@10.7
    </p>
  </Column>
</Row>

<Row>
  <Column noGutter>
    <Search
      size="lg"
      bind:value
      placeholder="{`Filter styles (e.g., "Monokai"`}"
    />
  </Column>
</Row>

<!-- <Row>
  <Column>
    <p class="body-short-01">
      Showing {filteredStyles.length} of {styles.length} styles
    </p>
  </Column>
</Row> -->

<Row>
  <Column>
    <Toggle
      labelText="Import method"
      size="sm"
      labelA="CSS StyleSheet"
      labelB="Injected styles"
      bind:toggled="{useInjectedStyles}"
    />
  </Column>
</Row>

{#if filteredStyles.length > 0}
  <Row>
    <Column noGutter>
      <StructuredList>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>Name</StructuredListCell>
            <StructuredListCell head>Import</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {#each filteredStyles as style (style.name)}
            <StructuredListRow>
              <StructuredListCell>
                <div class="mb-7">
                  <div class="label-01 mb-3">Language name</div>
                  <CodeSnippet type="inline" code="{style.name}" />
                </div>

                <div class="mb-7">
                  <div class="label-01 mb-3">Module name</div>
                  <CodeSnippet type="inline" code="{style.moduleName}" />
                </div>
              </StructuredListCell>
              <StructuredListCell>
                <ScopedStyle
                  {...style}
                  useInjectedStyles="{useInjectedStyles}"
                />
              </StructuredListCell>
            </StructuredListRow>
          {/each}
        </StructuredListBody>
      </StructuredList>
    </Column>
  </Row>
{/if}

{#if filteredStyles.length === 0}
  <Row>
    <Column>
      <p>
        No matches found for "{value}."
      </p>
    </Column>
  </Row>
{/if}
