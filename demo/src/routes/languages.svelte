<script>
  import {
    Row,
    Column,
    StructuredList,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,
    CodeSnippet,
    Search,
    Toggle,
  } from "carbon-components-svelte";
  import HighlightAuto from "svelte-highlight/src/HighlightAuto.svelte";
  import github from "svelte-highlight/src/styles/github";
  import languages from "$lib/languages.json";

  function formatCode(name, moduleName, useDirectImport) {
    return `<script>
  import Highlight from "svelte-highlight";
  import ${
    useDirectImport ? moduleName : `{ ${moduleName} }`
  } from "svelte-highlight/src/languages${useDirectImport ? `/${name}` : ""}";
<\/script>

<Highlight language={${moduleName}} code="code" />`;
  }

  let value = "";
  let useDirectImport = true;

  $: normalizedValue = value.toLowerCase();
  $: filteredLanguages = languages.filter(
    (language) =>
      language.name.toLowerCase().includes(normalizedValue) ||
      language.moduleName.toLowerCase().includes(normalizedValue)
  );
</script>

<svelte:head>
  {@html github}
</svelte:head>

<Row>
  <Column>
    <p>
      {languages.length} languages exported from highlight.js@10.7
    </p>
  </Column>
</Row>

<Row>
  <Column noGutter>
    <Search
      size="lg"
      bind:value
      placeholder="{`Filter languages (e.g., "JavaScript"`}"
    />
  </Column>
</Row>

<Row>
  <Column>
    <p class="body-short-01">
      Showing {filteredLanguages.length} of {languages.length} languages
    </p>
  </Column>
</Row>

<Row>
  <Column>
    <Toggle
      labelText="Import method"
      size="sm"
      labelA="Base import"
      labelB="Direct import (recommended)"
      bind:toggled="{useDirectImport}"
    />
  </Column>
</Row>

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
        {#each filteredLanguages as language (language.name)}
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
              <HighlightAuto
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
