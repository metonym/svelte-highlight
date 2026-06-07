<script>
  import { previewThemes } from "@www/preview/preview-themes";
  import { vueKitchenSink } from "@www/preview/vue-kitchen-sink";
  import { vuePreviewSnippets } from "@www/preview/vue-preview-snippets";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import vue from "svelte-highlight/languages/vue";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import dracula from "svelte-highlight/styles/dracula";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";
  import horizonDark from "svelte-highlight/styles/horizon-dark";
  import nord from "svelte-highlight/styles/nord";

  /** @type {Record<string, string>} */
  const themeCss = {
    horizonDark,
    atomOneDark,
    githubDark,
    dracula,
    nord,
    github,
  };
</script>

<svelte:head>
  {#each Object.values(themeCss) as css}
    {@html css}
  {/each}
</svelte:head>

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
