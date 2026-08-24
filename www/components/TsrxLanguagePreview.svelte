<script>
  import { previewThemes } from "@www/preview/preview-themes";
  import { tsrxKitchenSink } from "@www/preview/tsrx-kitchen-sink";
  import { tsrxPreviewSnippets } from "@www/preview/tsrx-preview-snippets";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import tsrx from "svelte-highlight/languages/tsrx";
</script>

{#each tsrxPreviewSnippets as snippet, index}
  <Row class="mb-9">
    <Column xlg={12}>
      <h3>{index + 1}. {snippet.title}</h3>
      {#if snippet.description}
        <div class="label-01 mb-3">{snippet.description}</div>
      {/if}
    </Column>
    {#each previewThemes as theme}
      <Column xlg={10} lg={10} md={12} class="mb-5">
        <div class="label-01 mb-3">{theme.name}</div>
        <Highlight
          class={theme.moduleName}
          language={tsrx}
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
        language={tsrx}
        code={tsrxKitchenSink}
        langtag
      />
    </Column>
  {/each}
</Row>
