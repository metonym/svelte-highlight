<script>
  import { markoKitchenSink } from "@www/preview/marko-kitchen-sink";
  import { markoPreviewSnippets } from "@www/preview/marko-preview-snippets";
  import { previewThemes } from "@www/preview/preview-themes";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import marko from "svelte-highlight/languages/marko";
</script>

{#each markoPreviewSnippets as snippet, index}
  <Row class="mb-9">
    <Column xlg={12}>
      <h3>{index + 1}. {snippet.title}</h3>
    </Column>
    {#each previewThemes as theme}
      <Column xlg={10} lg={10} md={12} class="mb-5">
        <div class="label-01 mb-3">{theme.name}</div>
        <Highlight
          class={theme.moduleName}
          language={marko}
          code={snippet.code}
          langtag
        />
      </Column>
    {/each}
  </Row>
{/each}

<Row class="mb-9">
  <Column xlg={12}>
    <h3>Kitchen sink</h3>
  </Column>
  {#each previewThemes as theme}
    <Column xlg={10} lg={10} md={12} class="mb-5">
      <div class="label-01 mb-3">{theme.name}</div>
      <Highlight
        class={theme.moduleName}
        language={marko}
        code={markoKitchenSink}
        langtag
      />
    </Column>
  {/each}
</Row>
