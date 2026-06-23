<script>
  import { bicepPreviewSnippets } from "@www/preview/bicep-preview-snippets";
  import { cypherPreviewSnippets } from "@www/preview/cypher-preview-snippets";
  import { dotenvPreviewSnippets } from "@www/preview/dotenv-preview-snippets";
  import { fishPreviewSnippets } from "@www/preview/fish-preview-snippets";
  import { gleamPreviewSnippets } from "@www/preview/gleam-preview-snippets";
  import { hclPreviewSnippets } from "@www/preview/hcl-preview-snippets";
  import { json5PreviewSnippets } from "@www/preview/json5-preview-snippets";
  import { jsoncPreviewSnippets } from "@www/preview/jsonc-preview-snippets";
  import { movePreviewSnippets } from "@www/preview/move-preview-snippets";
  import { nushellPreviewSnippets } from "@www/preview/nushell-preview-snippets";
  import { previewThemes } from "@www/preview/preview-themes";
  import { prismaPreviewSnippets } from "@www/preview/prisma-preview-snippets";
  import { promqlPreviewSnippets } from "@www/preview/promql-preview-snippets";
  import { rescriptPreviewSnippets } from "@www/preview/rescript-preview-snippets";
  import { solidityPreviewSnippets } from "@www/preview/solidity-preview-snippets";
  import { starlarkPreviewSnippets } from "@www/preview/starlark-preview-snippets";
  import { tomlPreviewSnippets } from "@www/preview/toml-preview-snippets";
  import { wgslPreviewSnippets } from "@www/preview/wgsl-preview-snippets";
  import { zigPreviewSnippets } from "@www/preview/zig-preview-snippets";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import bicep from "svelte-highlight/languages/bicep";
  import cypher from "svelte-highlight/languages/cypher";
  import dotenv from "svelte-highlight/languages/dotenv";
  import fish from "svelte-highlight/languages/fish";
  import gleam from "svelte-highlight/languages/gleam";
  import hcl from "svelte-highlight/languages/hcl";
  import json5 from "svelte-highlight/languages/json5";
  import jsonc from "svelte-highlight/languages/jsonc";
  import move from "svelte-highlight/languages/move";
  import nushell from "svelte-highlight/languages/nushell";
  import prisma from "svelte-highlight/languages/prisma";
  import promql from "svelte-highlight/languages/promql";
  import rescript from "svelte-highlight/languages/rescript";
  import solidity from "svelte-highlight/languages/solidity";
  import starlark from "svelte-highlight/languages/starlark";
  import toml from "svelte-highlight/languages/toml";
  import wgsl from "svelte-highlight/languages/wgsl";
  import zig from "svelte-highlight/languages/zig";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  import dracula from "svelte-highlight/styles/dracula";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";
  import horizonDark from "svelte-highlight/styles/horizon-dark";
  import nord from "svelte-highlight/styles/nord";

  /** @type {"solidity" | "hcl" | "zig" | "prisma" | "toml" | "fish" | "nushell" | "gleam" | "json5" | "jsonc" | "dotenv" | "wgsl" | "cypher" | "promql" | "bicep" | "rescript" | "starlark" | "move"} */
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
    cypher: { lang: cypher, snippets: cypherPreviewSnippets },
    promql: { lang: promql, snippets: promqlPreviewSnippets },
    bicep: { lang: bicep, snippets: bicepPreviewSnippets },
    rescript: { lang: rescript, snippets: rescriptPreviewSnippets },
    starlark: { lang: starlark, snippets: starlarkPreviewSnippets },
    move: { lang: move, snippets: movePreviewSnippets },
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
