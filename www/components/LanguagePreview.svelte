<script>
  import { hclPreviewSnippets } from "@www/preview/hcl-preview-snippets";
  import { previewThemes } from "@www/preview/preview-themes";
  import { prismaPreviewSnippets } from "@www/preview/prisma-preview-snippets";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import hcl from "svelte-highlight/languages/hcl";
  import prisma from "svelte-highlight/languages/prisma";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import dracula from "svelte-highlight/styles/dracula";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";
  import horizonDark from "svelte-highlight/styles/horizon-dark";
  import nord from "svelte-highlight/styles/nord";

  /** @type {"hcl" | "prisma"} */
  export let language;

  const registry = {
    hcl: { lang: hcl, snippets: hclPreviewSnippets },
    prisma: { lang: prisma, snippets: prismaPreviewSnippets },
  };

  $: ({ lang, snippets } = registry[language]);

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

{#each snippets as snippet, index}
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
          language={lang}
          code={snippet.code}
          langtag
        />
      </Column>
    {/each}
  </Row>
{/each}
