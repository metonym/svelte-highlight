<script>
  import CodeSnippet from "@components/CodeSnippet.svelte";
  import ListSearch from "@components/ListSearch.svelte";
  import ScopedLanguage from "@components/ScopedLanguage.svelte";
  import languages from "@www/data/languages.json";
  import {
    Column,
    Row,
    StructuredList,
    StructuredListBody,
    StructuredListCell,
    StructuredListHead,
    StructuredListRow,
  } from "carbon-components-svelte";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<ListSearch
  items={languages}
  itemName="language"
  placeholderExample="JavaScript"
  let:currentLabel
  let:filteredIds
>
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
          {#each languages as language (language.name)}
            <StructuredListRow
              class={!filteredIds.has(language.name) ? "hidden" : ""}
              style="content-visibility: auto; contain-intrinsic-size: 0 204px;"
            >
              <StructuredListCell>
                <div class="mb-5">
                  <div class="label-01 mb-3">Language name</div>
                  <CodeSnippet type="inline" code={language.name} />
                </div>

                <div class="mb-5">
                  <div class="label-01 mb-3">Module name</div>
                  <CodeSnippet type="inline" code={language.moduleName} />
                </div>
              </StructuredListCell>
              <StructuredListCell>
                <ScopedLanguage
                  name={language.name}
                  moduleName={language.moduleName}
                  useDirectImport={currentLabel === "Direct import"}
                />
              </StructuredListCell>
            </StructuredListRow>
          {/each}
        </StructuredListBody>
      </StructuredList>
    </Column>
  </Row>
</ListSearch>
