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
  import HighlightSvelte from "svelte-highlight/src/HighlightSvelte.svelte";
  import atomOneDark from "svelte-highlight/src/styles/atom-one-dark";
  import ListSearch from "$lib/ListSearch.svelte";
  import CodeSnippet from "$lib/CodeSnippet.svelte";
  import languages from "$lib/languages.json";

  let currentLabel = "Direct import";
  let filtered = [];

  $: useDirectImport = currentLabel === "Direct import";

  function formatCode(name, moduleName, useDirectImport) {
    return `<script>
  import Highlight from "svelte-highlight";
  import ${
    useDirectImport ? moduleName : `{ ${moduleName} }`
  } from "svelte-highlight/src/languages${useDirectImport ? `/${name}` : ""}";
<\/script>

<Highlight language={${moduleName}} code="code" />`;
  }
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<ListSearch
  items="{languages}"
  itemName="language"
  placeholderExample="JavaScript"
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
            {#each filtered as language (language.name)}
              <StructuredListRow>
                <StructuredListCell>
                  <div class="mb-7">
                    <div class="label-01 mb-3">Language name</div>
                    <CodeSnippet type="inline" code="{language.name}" />
                  </div>

                  <div class="mb-7">
                    <div class="label-01 mb-3">Module name</div>
                    <CodeSnippet type="inline" code="{language.moduleName}" />
                  </div>
                </StructuredListCell>
                <StructuredListCell>
                  <HighlightSvelte
                    code="{formatCode(
                      language.name,
                      language.moduleName,
                      useDirectImport
                    )}"
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
