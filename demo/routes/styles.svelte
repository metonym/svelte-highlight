<script>
  import {
    Row,
    Column,
    StructuredList,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,
  } from "carbon-components-svelte";
  import ScopedStyle from "$lib/ScopedStyle.svelte";
  import CodeSnippet from "$lib/CodeSnippet.svelte";
  import ListSearch from "$lib/ListSearch.svelte";
  import styles from "$lib/styles.json";

  let currentLabel = "Injected styles";
  let filtered = [];

  $: useInjectedStyles = currentLabel === "Injected styles";
</script>

<ListSearch
  items="{styles}"
  itemName="style"
  labelA="CSS StyleSheet"
  labelB="Injected styles"
  placeholderExample="Monokai"
  bind:currentLabel
  bind:filtered
>
  {#if filtered.length > 0}
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
            {#each filtered as style (style.name)}
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
</ListSearch>
