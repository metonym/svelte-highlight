<script>
  // @ts-check

  import {
    Row,
    Column,
    StructuredList,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,
    Toggle,
  } from "carbon-components-svelte";
  import ScopedStyle from "@components/ScopedStyle.svelte";
  import CodeSnippet from "@components/CodeSnippet.svelte";
  import ListSearch from "@components/ListSearch.svelte";
  import styles from "@www/data/styles.json";

  let useCdnImport = false;
</script>

<ListSearch
  items={styles}
  itemName="style"
  labelA="CSS StyleSheet"
  labelB="Injected styles"
  placeholderExample="Monokai"
  let:currentLabel
  let:filteredIds
>
  {@const useInjectedStyles = currentLabel === "Injected styles"}
  {#if !useInjectedStyles}
    <Row>
      <Column xlg={3} lg={12}>
        <Toggle
          size="sm"
          labelText="Import from CDN (unpkg.com)"
          bind:toggled={useCdnImport}
        />
      </Column>
    </Row>
  {/if}

  <Row class={filteredIds.size === 0 ? "hidden" : ""} style="overflow-x: auto">
    <Column noGutter>
      <StructuredList>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head style="width: 18rem">
              Name
            </StructuredListCell>
            <StructuredListCell head>Import</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {#each styles as style (style.name)}
            <StructuredListRow
              class={!filteredIds.has(style.name) ? "hidden" : ""}
            >
              <StructuredListCell>
                <div class="mb-5">
                  <div class="label-01 mb-3">Style name</div>
                  <CodeSnippet type="inline" code={style.name} />
                </div>

                <div class="mb-5">
                  <div class="label-01 mb-3">Module name</div>
                  <CodeSnippet type="inline" code={style.moduleName} />
                </div>
              </StructuredListCell>
              <StructuredListCell>
                <ScopedStyle {...style} {useInjectedStyles} {useCdnImport} />
              </StructuredListCell>
            </StructuredListRow>
          {/each}
        </StructuredListBody>
      </StructuredList>
    </Column>
  </Row>
</ListSearch>
