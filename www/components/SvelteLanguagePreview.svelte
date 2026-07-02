<script>
  import { svelteKitchenSink } from "@www/preview/svelte-kitchen-sink";
  import { sveltePreviewSnippets } from "@www/preview/svelte-preview-snippets";
  import { sveltePreviewThemes } from "@www/preview/svelte-preview-themes";
  import { Column, Row } from "carbon-components-svelte";
  import HighlightSvelte from "svelte-highlight/HighlightSvelte.svelte";
</script>

{#each sveltePreviewSnippets as snippet, index}
  <Row class="mb-9">
    <Column xlg={12}>
      <h3>{index + 1}. {snippet.title}</h3>
    </Column>
    {#each sveltePreviewThemes as theme}
      <Column xlg={10} lg={10} md={12} class="mb-5">
        <div class="label-01 mb-3">{theme.name}</div>
        <HighlightSvelte class={theme.moduleName} code={snippet.code} langtag />
      </Column>
    {/each}
  </Row>
{/each}

<Row class="mb-9">
  <Column xlg={12}>
    <h3>Kitchen sink</h3>
  </Column>
  {#each sveltePreviewThemes as theme}
    <Column xlg={10} lg={10} md={12} class="mb-5">
      <div class="label-01 mb-3">{theme.name}</div>
      <HighlightSvelte
        class={theme.moduleName}
        code={svelteKitchenSink}
        langtag
      />
    </Column>
  {/each}
</Row>
