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
  } from "carbon-components-svelte";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import ListSearch from "@components/ListSearch.svelte";
  import CodeSnippet from "@components/CodeSnippet.svelte";
  import ScopedLanguage from "@components/ScopedLanguage.svelte";
  import languages from "@www/data/languages.json";
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
  <Row class={filteredIds.size === 0 ? "hidden" : ""}>
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
            >
              <StructuredListCell>
                <div class="mb-7">
                  <div class="label-01 mb-3">Language name</div>
                  <CodeSnippet type="inline" code={language.name} />
                </div>

                <div class="mb-7">
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
