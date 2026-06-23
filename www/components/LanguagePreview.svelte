<script>
  import { dotenvPreviewSnippets } from "@www/preview/dotenv-preview-snippets";
  import { fishPreviewSnippets } from "@www/preview/fish-preview-snippets";
  import { gleamPreviewSnippets } from "@www/preview/gleam-preview-snippets";
  import { hclPreviewSnippets } from "@www/preview/hcl-preview-snippets";
  import { json5PreviewSnippets } from "@www/preview/json5-preview-snippets";
  import { jsoncPreviewSnippets } from "@www/preview/jsonc-preview-snippets";
  import { nushellPreviewSnippets } from "@www/preview/nushell-preview-snippets";
  import { previewThemes } from "@www/preview/preview-themes";
  import { prismaPreviewSnippets } from "@www/preview/prisma-preview-snippets";
  import { solidityPreviewSnippets } from "@www/preview/solidity-preview-snippets";
  import { tomlPreviewSnippets } from "@www/preview/toml-preview-snippets";
  import { wgslPreviewSnippets } from "@www/preview/wgsl-preview-snippets";
  import { zigPreviewSnippets } from "@www/preview/zig-preview-snippets";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import dotenv from "svelte-highlight/languages/dotenv";
  import fish from "svelte-highlight/languages/fish";
  import gleam from "svelte-highlight/languages/gleam";
  import hcl from "svelte-highlight/languages/hcl";
  import json5 from "svelte-highlight/languages/json5";
  import jsonc from "svelte-highlight/languages/jsonc";
  import nushell from "svelte-highlight/languages/nushell";
  import prisma from "svelte-highlight/languages/prisma";
  import solidity from "svelte-highlight/languages/solidity";
  import toml from "svelte-highlight/languages/toml";
  import wgsl from "svelte-highlight/languages/wgsl";
  import zig from "svelte-highlight/languages/zig";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import dracula from "svelte-highlight/styles/dracula";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";
  import horizonDark from "svelte-highlight/styles/horizon-dark";
  import nord from "svelte-highlight/styles/nord";

  /** @type {"solidity" | "hcl" | "zig" | "prisma" | "toml" | "fish" | "nushell" | "gleam" | "json5" | "jsonc" | "dotenv" | "wgsl"} */
  export let language;

  const registry = {
    solidity: { lang: solidity, snippets: solidityPreviewSnippets },
    hcl: { lang: hcl, snippets: hclPreviewSnippets },
    zig: { lang: zig, snippets: zigPreviewSnippets },
    prisma: { lang: prisma, snippets: prismaPreviewSnippets },
    toml: { lang: toml, snippets: tomlPreviewSnippets },
    fish: { lang: fish, snippets: fishPreviewSnippets },
    nushell: { lang: nushell, snippets: nushellPreviewSnippets },
    gleam: { lang: gleam, snippets: gleamPreviewSnippets },
    json5: { lang: json5, snippets: json5PreviewSnippets },
    jsonc: { lang: jsonc, snippets: jsoncPreviewSnippets },
    dotenv: { lang: dotenv, snippets: dotenvPreviewSnippets },
    wgsl: { lang: wgsl, snippets: wgslPreviewSnippets },
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
