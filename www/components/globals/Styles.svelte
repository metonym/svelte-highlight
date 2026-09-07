<script>
  import CodeSnippet from "@components/CodeSnippet.svelte";
  import ListSearch from "@components/ListSearch.svelte";
  import ScopedStyle from "@components/ScopedStyle.svelte";
  import styles from "@www/data/styles.json";
  import {
    Column,
    Row,
    StructuredList,
    StructuredListBody,
    StructuredListCell,
    StructuredListHead,
    StructuredListRow,
    Toggle,
  } from "carbon-components-svelte";

  let useCdnImport = false;
  let customOnly = false;
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
  <Row>
    <Column xlg={3} lg={12}>
      <Toggle
        size="sm"
        labelText="Custom styles only"
        bind:toggled={customOnly}
      />
    </Column>
  </Row>
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
              class={filteredIds.has(style.name) &&
              (!customOnly || style.custom)
                ? ""
                : "hidden"}
              style="content-visibility: auto; contain-intrinsic-size: 0 360px;"
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

                {#if style.description}
                  <div class="mb-5">
                    <div class="label-01 mb-3">Description</div>
                    {style.description}
                  </div>
                {/if}
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
