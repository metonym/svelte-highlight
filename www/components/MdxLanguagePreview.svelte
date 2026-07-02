<script>
  import { mdxKitchenSink } from "@www/preview/mdx-kitchen-sink";
  import { mdxPreviewSnippets } from "@www/preview/mdx-preview-snippets";
  import { previewThemes } from "@www/preview/preview-themes";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import mdx from "svelte-highlight/languages/mdx";
</script>

{#each mdxPreviewSnippets as snippet, index}
  <Row class="mb-9">
    <Column xlg={12}>
      <h3>{index + 1}. {snippet.title}</h3>
    </Column>
    {#each previewThemes as theme}
      <Column xlg={10} lg={10} md={12} class="mb-5">
        <div class="label-01 mb-3">{theme.name}</div>
        <Highlight
          class={theme.moduleName}
          language={mdx}
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
        language={mdx}
        code={mdxKitchenSink}
        langtag
      />
    </Column>
  {/each}
</Row>
