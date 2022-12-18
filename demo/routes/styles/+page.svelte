<script>
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
  import ScopedStyle from "../../lib/ScopedStyle.svelte";
  import CodeSnippet from "../../lib/CodeSnippet.svelte";
  import ListSearch from "../../lib/ListSearch.svelte";
  import styles from "../../lib/styles.json";

  let useCdnImport = false;
</script>

<ListSearch
  items={styles}
  itemName="style"
  labelA="CSS StyleSheet"
  labelB="Injected styles"
  placeholderExample="Monokai"
  let:currentLabel
  let:filtered
>
  {@const useInjectedStyles = currentLabel === "Injected styles"}
  {#if !useInjectedStyles}
    <Row>
      <Column xlg={9} lg={12}>
        <p class="mb-5">
          CSS StyleSheets can also be externally linked from a Content Delivery
          Network (CDN). This is best suited for prototyping and not recommended
          for production use.
        </p>
        <Toggle
          size="sm"
          labelText="Import from UNPKG"
          bind:toggled={useCdnImport}
        />
      </Column>
    </Row>
  {/if}

  {#if filtered.length > 0}
    <Row>
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
            {#each filtered as style (style.name)}
              <StructuredListRow>
                <StructuredListCell>
                  <div class="mb-7">
                    <div class="label-01 mb-3">Style name</div>
                    <CodeSnippet type="inline" code={style.name} />
                  </div>

                  <div class="mb-7">
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
  {/if}
</ListSearch>
