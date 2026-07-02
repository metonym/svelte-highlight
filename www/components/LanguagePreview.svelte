<script>
  import { bibtexPreviewSnippets } from "@www/preview/bibtex-preview-snippets";
  import { bicepPreviewSnippets } from "@www/preview/bicep-preview-snippets";
  import { caddyPreviewSnippets } from "@www/preview/caddy-preview-snippets";
  import { cairoPreviewSnippets } from "@www/preview/cairo-preview-snippets";
  import { clarityPreviewSnippets } from "@www/preview/clarity-preview-snippets";
  import { cuePreviewSnippets } from "@www/preview/cue-preview-snippets";
  import { cypherPreviewSnippets } from "@www/preview/cypher-preview-snippets";
  import { d2PreviewSnippets } from "@www/preview/d2-preview-snippets";
  import { daxPreviewSnippets } from "@www/preview/dax-preview-snippets";
  import { dhallPreviewSnippets } from "@www/preview/dhall-preview-snippets";
  import { dotenvPreviewSnippets } from "@www/preview/dotenv-preview-snippets";
  import { fishPreviewSnippets } from "@www/preview/fish-preview-snippets";
  import { gleamPreviewSnippets } from "@www/preview/gleam-preview-snippets";
  import { groqPreviewSnippets } from "@www/preview/groq-preview-snippets";
  import { hclPreviewSnippets } from "@www/preview/hcl-preview-snippets";
  import { hlslPreviewSnippets } from "@www/preview/hlsl-preview-snippets";
  import { jqPreviewSnippets } from "@www/preview/jq-preview-snippets";
  import { json5PreviewSnippets } from "@www/preview/json5-preview-snippets";
  import { jsoncPreviewSnippets } from "@www/preview/jsonc-preview-snippets";
  import { jsonnetPreviewSnippets } from "@www/preview/jsonnet-preview-snippets";
  import { kqlPreviewSnippets } from "@www/preview/kql-preview-snippets";
  import { logqlPreviewSnippets } from "@www/preview/logql-preview-snippets";
  import { movePreviewSnippets } from "@www/preview/move-preview-snippets";
  import { nickelPreviewSnippets } from "@www/preview/nickel-preview-snippets";
  import { nushellPreviewSnippets } from "@www/preview/nushell-preview-snippets";
  import { odinPreviewSnippets } from "@www/preview/odin-preview-snippets";
  import { pklPreviewSnippets } from "@www/preview/pkl-preview-snippets";
  import { previewThemes } from "@www/preview/preview-themes";
  import { prismaPreviewSnippets } from "@www/preview/prisma-preview-snippets";
  import { promqlPreviewSnippets } from "@www/preview/promql-preview-snippets";
  import { pugPreviewSnippets } from "@www/preview/pug-preview-snippets";
  import { razorPreviewSnippets } from "@www/preview/razor-preview-snippets";
  import { regoPreviewSnippets } from "@www/preview/rego-preview-snippets";
  import { rescriptPreviewSnippets } from "@www/preview/rescript-preview-snippets";
  import { rstPreviewSnippets } from "@www/preview/rst-preview-snippets";
  import { solidityPreviewSnippets } from "@www/preview/solidity-preview-snippets";
  import { starlarkPreviewSnippets } from "@www/preview/starlark-preview-snippets";
  import { templPreviewSnippets } from "@www/preview/templ-preview-snippets";
  import { tomlPreviewSnippets } from "@www/preview/toml-preview-snippets";
  import { typstPreviewSnippets } from "@www/preview/typst-preview-snippets";
  import { vPreviewSnippets } from "@www/preview/v-preview-snippets";
  import { vyperPreviewSnippets } from "@www/preview/vyper-preview-snippets";
  import { wgslPreviewSnippets } from "@www/preview/wgsl-preview-snippets";
  import { zigPreviewSnippets } from "@www/preview/zig-preview-snippets";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import bibtex from "svelte-highlight/languages/bibtex";
  import bicep from "svelte-highlight/languages/bicep";
  import caddy from "svelte-highlight/languages/caddy";
  import cairo from "svelte-highlight/languages/cairo";
  import clarity from "svelte-highlight/languages/clarity";
  import cue from "svelte-highlight/languages/cue";
  import cypher from "svelte-highlight/languages/cypher";
  import d2 from "svelte-highlight/languages/d2";
  import dax from "svelte-highlight/languages/dax";
  import dhall from "svelte-highlight/languages/dhall";
  import dotenv from "svelte-highlight/languages/dotenv";
  import fish from "svelte-highlight/languages/fish";
  import gleam from "svelte-highlight/languages/gleam";
  import groq from "svelte-highlight/languages/groq";
  import hcl from "svelte-highlight/languages/hcl";
  import hlsl from "svelte-highlight/languages/hlsl";
  import jq from "svelte-highlight/languages/jq";
  import json5 from "svelte-highlight/languages/json5";
  import jsonc from "svelte-highlight/languages/jsonc";
  import jsonnet from "svelte-highlight/languages/jsonnet";
  import kql from "svelte-highlight/languages/kql";
  import logql from "svelte-highlight/languages/logql";
  import move from "svelte-highlight/languages/move";
  import nickel from "svelte-highlight/languages/nickel";
  import nushell from "svelte-highlight/languages/nushell";
  import odin from "svelte-highlight/languages/odin";
  import pkl from "svelte-highlight/languages/pkl";
  import prisma from "svelte-highlight/languages/prisma";
  import promql from "svelte-highlight/languages/promql";
  import pug from "svelte-highlight/languages/pug";
  import razor from "svelte-highlight/languages/razor";
  import rego from "svelte-highlight/languages/rego";
  import rescript from "svelte-highlight/languages/rescript";
  import rst from "svelte-highlight/languages/rst";
  import solidity from "svelte-highlight/languages/solidity";
  import starlark from "svelte-highlight/languages/starlark";
  import templ from "svelte-highlight/languages/templ";
  import toml from "svelte-highlight/languages/toml";
  import typst from "svelte-highlight/languages/typst";
  import v from "svelte-highlight/languages/v";
  import vyper from "svelte-highlight/languages/vyper";
  import wgsl from "svelte-highlight/languages/wgsl";
  import zig from "svelte-highlight/languages/zig";

  /** @type {"solidity" | "hcl" | "zig" | "prisma" | "toml" | "fish" | "nushell" | "gleam" | "json5" | "jsonc" | "dotenv" | "groq" | "wgsl" | "cypher" | "promql" | "bicep" | "rescript" | "starlark" | "move" | "cairo" | "vyper" | "clarity" | "cue" | "jsonnet" | "dhall" | "pkl" | "nickel" | "pug" | "razor" | "v" | "odin" | "caddy" | "d2" | "bibtex" | "jq" | "kql" | "logql" | "rego" | "dax" | "typst" | "rst" | "templ" | "hlsl"} */
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
    groq: { lang: groq, snippets: groqPreviewSnippets },
    wgsl: { lang: wgsl, snippets: wgslPreviewSnippets },
    cypher: { lang: cypher, snippets: cypherPreviewSnippets },
    promql: { lang: promql, snippets: promqlPreviewSnippets },
    bicep: { lang: bicep, snippets: bicepPreviewSnippets },
    rescript: { lang: rescript, snippets: rescriptPreviewSnippets },
    starlark: { lang: starlark, snippets: starlarkPreviewSnippets },
    move: { lang: move, snippets: movePreviewSnippets },
    cairo: { lang: cairo, snippets: cairoPreviewSnippets },
    vyper: { lang: vyper, snippets: vyperPreviewSnippets },
    clarity: { lang: clarity, snippets: clarityPreviewSnippets },
    cue: { lang: cue, snippets: cuePreviewSnippets },
    jsonnet: { lang: jsonnet, snippets: jsonnetPreviewSnippets },
    dhall: { lang: dhall, snippets: dhallPreviewSnippets },
    pkl: { lang: pkl, snippets: pklPreviewSnippets },
    nickel: { lang: nickel, snippets: nickelPreviewSnippets },
    pug: { lang: pug, snippets: pugPreviewSnippets },
    razor: { lang: razor, snippets: razorPreviewSnippets },
    v: { lang: v, snippets: vPreviewSnippets },
    odin: { lang: odin, snippets: odinPreviewSnippets },
    caddy: { lang: caddy, snippets: caddyPreviewSnippets },
    d2: { lang: d2, snippets: d2PreviewSnippets },
    bibtex: { lang: bibtex, snippets: bibtexPreviewSnippets },
    jq: { lang: jq, snippets: jqPreviewSnippets },
    kql: { lang: kql, snippets: kqlPreviewSnippets },
    logql: { lang: logql, snippets: logqlPreviewSnippets },
    rego: { lang: rego, snippets: regoPreviewSnippets },
    dax: { lang: dax, snippets: daxPreviewSnippets },
    typst: { lang: typst, snippets: typstPreviewSnippets },
    rst: { lang: rst, snippets: rstPreviewSnippets },
    templ: { lang: templ, snippets: templPreviewSnippets },
    hlsl: { lang: hlsl, snippets: hlslPreviewSnippets },
  };

  $: ({ lang, snippets } = registry[language]);
</script>

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
