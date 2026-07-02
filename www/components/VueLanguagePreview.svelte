<script>
  import { previewThemes } from "@www/preview/preview-themes";
  import { vueKitchenSink } from "@www/preview/vue-kitchen-sink";
  import { vuePreviewSnippets } from "@www/preview/vue-preview-snippets";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import vue from "svelte-highlight/languages/vue";
</script>

{#each vuePreviewSnippets as snippet, index}
  <Row class="mb-9">
    <Column xlg={12}>
      <h3>{index + 1}. {snippet.title}</h3>
    </Column>
    {#each previewThemes as theme}
      <Column xlg={10} lg={10} md={12} class="mb-5">
        <div class="label-01 mb-3">{theme.name}</div>
        <Highlight
          class={theme.moduleName}
          language={vue}
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
        language={vue}
        code={vueKitchenSink}
        langtag
      />
    </Column>
  {/each}
</Row>
