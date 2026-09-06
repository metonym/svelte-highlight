<script>
  import { agdaPreviewSnippets } from "@www/preview/agda-preview-snippets";
  import { angularPreviewSnippets } from "@www/preview/angular-preview-snippets";
  import { assemblyscriptPreviewSnippets } from "@www/preview/assemblyscript-preview-snippets";
  import { bamlPreviewSnippets } from "@www/preview/baml-preview-snippets";
  import { bendPreviewSnippets } from "@www/preview/bend-preview-snippets";
  import { bibtexPreviewSnippets } from "@www/preview/bibtex-preview-snippets";
  import { bicepPreviewSnippets } from "@www/preview/bicep-preview-snippets";
  import { bitbakePreviewSnippets } from "@www/preview/bitbake-preview-snippets";
  import { blueprintPreviewSnippets } from "@www/preview/blueprint-preview-snippets";
  import { bpftracePreviewSnippets } from "@www/preview/bpftrace-preview-snippets";
  import { bqnPreviewSnippets } from "@www/preview/bqn-preview-snippets";
  import { c3PreviewSnippets } from "@www/preview/c3-preview-snippets";
  import { caddyPreviewSnippets } from "@www/preview/caddy-preview-snippets";
  import { cairoPreviewSnippets } from "@www/preview/cairo-preview-snippets";
  import { cedarPreviewSnippets } from "@www/preview/cedar-preview-snippets";
  import { celPreviewSnippets } from "@www/preview/cel-preview-snippets";
  import { ciscoPreviewSnippets } from "@www/preview/cisco-preview-snippets";
  import { civetPreviewSnippets } from "@www/preview/civet-preview-snippets";
  import { clarityPreviewSnippets } from "@www/preview/clarity-preview-snippets";
  import { codeqlPreviewSnippets } from "@www/preview/codeql-preview-snippets";
  import { cqlPreviewSnippets } from "@www/preview/cql-preview-snippets";
  import { cuePreviewSnippets } from "@www/preview/cue-preview-snippets";
  import { cypherPreviewSnippets } from "@www/preview/cypher-preview-snippets";
  import { d2PreviewSnippets } from "@www/preview/d2-preview-snippets";
  import { datalogPreviewSnippets } from "@www/preview/datalog-preview-snippets";
  import { daxPreviewSnippets } from "@www/preview/dax-preview-snippets";
  import { dhallPreviewSnippets } from "@www/preview/dhall-preview-snippets";
  import { dotenvPreviewSnippets } from "@www/preview/dotenv-preview-snippets";
  import { dtracePreviewSnippets } from "@www/preview/dtrace-preview-snippets";
  import { earthfilePreviewSnippets } from "@www/preview/earthfile-preview-snippets";
  import { ejsPreviewSnippets } from "@www/preview/ejs-preview-snippets";
  import { esqlPreviewSnippets } from "@www/preview/esql-preview-snippets";
  import { fennelPreviewSnippets } from "@www/preview/fennel-preview-snippets";
  import { fishPreviewSnippets } from "@www/preview/fish-preview-snippets";
  import { fluxPreviewSnippets } from "@www/preview/flux-preview-snippets";
  import { gbnfPreviewSnippets } from "@www/preview/gbnf-preview-snippets";
  import { gdscriptPreviewSnippets } from "@www/preview/gdscript-preview-snippets";
  import { gleamPreviewSnippets } from "@www/preview/gleam-preview-snippets";
  import { gotmplPreviewSnippets } from "@www/preview/gotmpl-preview-snippets";
  import { groqPreviewSnippets } from "@www/preview/groq-preview-snippets";
  import { hclPreviewSnippets } from "@www/preview/hcl-preview-snippets";
  import { heexPreviewSnippets } from "@www/preview/heex-preview-snippets";
  import { helmPreviewSnippets } from "@www/preview/helm-preview-snippets";
  import { hlslPreviewSnippets } from "@www/preview/hlsl-preview-snippets";
  import { hurlPreviewSnippets } from "@www/preview/hurl-preview-snippets";
  import { idrisPreviewSnippets } from "@www/preview/idris-preview-snippets";
  import { imbaPreviewSnippets } from "@www/preview/imba-preview-snippets";
  import { jinjaPreviewSnippets } from "@www/preview/jinja-preview-snippets";
  import { jmespathPreviewSnippets } from "@www/preview/jmespath-preview-snippets";
  import { jqPreviewSnippets } from "@www/preview/jq-preview-snippets";
  import { json5PreviewSnippets } from "@www/preview/json5-preview-snippets";
  import { jsonataPreviewSnippets } from "@www/preview/jsonata-preview-snippets";
  import { jsoncPreviewSnippets } from "@www/preview/jsonc-preview-snippets";
  import { jsonnetPreviewSnippets } from "@www/preview/jsonnet-preview-snippets";
  import { justPreviewSnippets } from "@www/preview/just-preview-snippets";
  import { kclPreviewSnippets } from "@www/preview/kcl-preview-snippets";
  import { kconfigPreviewSnippets } from "@www/preview/kconfig-preview-snippets";
  import { kdlPreviewSnippets } from "@www/preview/kdl-preview-snippets";
  import { kokaPreviewSnippets } from "@www/preview/koka-preview-snippets";
  import { kqlPreviewSnippets } from "@www/preview/kql-preview-snippets";
  import { kvPreviewSnippets } from "@www/preview/kv-preview-snippets";
  import { leanPreviewSnippets } from "@www/preview/lean-preview-snippets";
  import { logqlPreviewSnippets } from "@www/preview/logql-preview-snippets";
  import { luauPreviewSnippets } from "@www/preview/luau-preview-snippets";
  import { mermaidPreviewSnippets } from "@www/preview/mermaid-preview-snippets";
  import { modelfilePreviewSnippets } from "@www/preview/modelfile-preview-snippets";
  import { mojoPreviewSnippets } from "@www/preview/mojo-preview-snippets";
  import { movePreviewSnippets } from "@www/preview/move-preview-snippets";
  import { nickelPreviewSnippets } from "@www/preview/nickel-preview-snippets";
  import { nushellPreviewSnippets } from "@www/preview/nushell-preview-snippets";
  import { odinPreviewSnippets } from "@www/preview/odin-preview-snippets";
  import { pklPreviewSnippets } from "@www/preview/pkl-preview-snippets";
  import { polarPreviewSnippets } from "@www/preview/polar-preview-snippets";
  import { previewThemes } from "@www/preview/preview-themes";
  import { prismaPreviewSnippets } from "@www/preview/prisma-preview-snippets";
  import { promqlPreviewSnippets } from "@www/preview/promql-preview-snippets";
  import { prqlPreviewSnippets } from "@www/preview/prql-preview-snippets";
  import { pugPreviewSnippets } from "@www/preview/pug-preview-snippets";
  import { purescriptPreviewSnippets } from "@www/preview/purescript-preview-snippets";
  import { racketPreviewSnippets } from "@www/preview/racket-preview-snippets";
  import { rakuPreviewSnippets } from "@www/preview/raku-preview-snippets";
  import { razorPreviewSnippets } from "@www/preview/razor-preview-snippets";
  import { regoPreviewSnippets } from "@www/preview/rego-preview-snippets";
  import { rescriptPreviewSnippets } from "@www/preview/rescript-preview-snippets";
  import { rocPreviewSnippets } from "@www/preview/roc-preview-snippets";
  import { rpmspecPreviewSnippets } from "@www/preview/rpmspec-preview-snippets";
  import { rstPreviewSnippets } from "@www/preview/rst-preview-snippets";
  import { slintPreviewSnippets } from "@www/preview/slint-preview-snippets";
  import { smithyPreviewSnippets } from "@www/preview/smithy-preview-snippets";
  import { snortPreviewSnippets } from "@www/preview/snort-preview-snippets";
  import { solidityPreviewSnippets } from "@www/preview/solidity-preview-snippets";
  import { sparqlPreviewSnippets } from "@www/preview/sparql-preview-snippets";
  import { splunkPreviewSnippets } from "@www/preview/splunk-preview-snippets";
  import { starlarkPreviewSnippets } from "@www/preview/starlark-preview-snippets";
  import { surrealqlPreviewSnippets } from "@www/preview/surrealql-preview-snippets";
  import { templPreviewSnippets } from "@www/preview/templ-preview-snippets";
  import { tomlPreviewSnippets } from "@www/preview/toml-preview-snippets";
  import { traceqlPreviewSnippets } from "@www/preview/traceql-preview-snippets";
  import { tsqPreviewSnippets } from "@www/preview/tsq-preview-snippets";
  import { tsrxPreviewSnippets } from "@www/preview/tsrx-preview-snippets";
  import { typespecPreviewSnippets } from "@www/preview/typespec-preview-snippets";
  import { typstPreviewSnippets } from "@www/preview/typst-preview-snippets";
  import { uiuaPreviewSnippets } from "@www/preview/uiua-preview-snippets";
  import { unisonPreviewSnippets } from "@www/preview/unison-preview-snippets";
  import { vPreviewSnippets } from "@www/preview/v-preview-snippets";
  import { versePreviewSnippets } from "@www/preview/verse-preview-snippets";
  import { vrlPreviewSnippets } from "@www/preview/vrl-preview-snippets";
  import { vyperPreviewSnippets } from "@www/preview/vyper-preview-snippets";
  import { wgslPreviewSnippets } from "@www/preview/wgsl-preview-snippets";
  import { witPreviewSnippets } from "@www/preview/wit-preview-snippets";
  import { yangPreviewSnippets } from "@www/preview/yang-preview-snippets";
  import { yaraPreviewSnippets } from "@www/preview/yara-preview-snippets";
  import { zigPreviewSnippets } from "@www/preview/zig-preview-snippets";
  import { Column, Row } from "carbon-components-svelte";
  import { Highlight } from "svelte-highlight";
  import agda from "svelte-highlight/languages/agda";
  import angular from "svelte-highlight/languages/angular";
  import assemblyscript from "svelte-highlight/languages/assemblyscript";
  import baml from "svelte-highlight/languages/baml";
  import bend from "svelte-highlight/languages/bend";
  import bibtex from "svelte-highlight/languages/bibtex";
  import bicep from "svelte-highlight/languages/bicep";
  import bitbake from "svelte-highlight/languages/bitbake";
  import blueprint from "svelte-highlight/languages/blueprint";
  import bpftrace from "svelte-highlight/languages/bpftrace";
  import bqn from "svelte-highlight/languages/bqn";
  import c3 from "svelte-highlight/languages/c3";
  import caddy from "svelte-highlight/languages/caddy";
  import cairo from "svelte-highlight/languages/cairo";
  import cedar from "svelte-highlight/languages/cedar";
  import cel from "svelte-highlight/languages/cel";
  import cisco from "svelte-highlight/languages/cisco";
  import civet from "svelte-highlight/languages/civet";
  import clarity from "svelte-highlight/languages/clarity";
  import codeql from "svelte-highlight/languages/codeql";
  import cql from "svelte-highlight/languages/cql";
  import cue from "svelte-highlight/languages/cue";
  import cypher from "svelte-highlight/languages/cypher";
  import d2 from "svelte-highlight/languages/d2";
  import datalog from "svelte-highlight/languages/datalog";
  import dax from "svelte-highlight/languages/dax";
  import dhall from "svelte-highlight/languages/dhall";
  import dotenv from "svelte-highlight/languages/dotenv";
  import dtrace from "svelte-highlight/languages/dtrace";
  import earthfile from "svelte-highlight/languages/earthfile";
  import ejs from "svelte-highlight/languages/ejs";
  import esql from "svelte-highlight/languages/esql";
  import fennel from "svelte-highlight/languages/fennel";
  import fish from "svelte-highlight/languages/fish";
  import flux from "svelte-highlight/languages/flux";
  import gbnf from "svelte-highlight/languages/gbnf";
  import gdscript from "svelte-highlight/languages/gdscript";
  import gleam from "svelte-highlight/languages/gleam";
  import gotmpl from "svelte-highlight/languages/gotmpl";
  import groq from "svelte-highlight/languages/groq";
  import hcl from "svelte-highlight/languages/hcl";
  import heex from "svelte-highlight/languages/heex";
  import helm from "svelte-highlight/languages/helm";
  import hlsl from "svelte-highlight/languages/hlsl";
  import hurl from "svelte-highlight/languages/hurl";
  import idris from "svelte-highlight/languages/idris";
  import imba from "svelte-highlight/languages/imba";
  import jinja from "svelte-highlight/languages/jinja";
  import jmespath from "svelte-highlight/languages/jmespath";
  import jq from "svelte-highlight/languages/jq";
  import json5 from "svelte-highlight/languages/json5";
  import jsonata from "svelte-highlight/languages/jsonata";
  import jsonc from "svelte-highlight/languages/jsonc";
  import jsonnet from "svelte-highlight/languages/jsonnet";
  import just from "svelte-highlight/languages/just";
  import kcl from "svelte-highlight/languages/kcl";
  import kconfig from "svelte-highlight/languages/kconfig";
  import kdl from "svelte-highlight/languages/kdl";
  import koka from "svelte-highlight/languages/koka";
  import kql from "svelte-highlight/languages/kql";
  import kv from "svelte-highlight/languages/kv";
  import lean from "svelte-highlight/languages/lean";
  import logql from "svelte-highlight/languages/logql";
  import luau from "svelte-highlight/languages/luau";
  import mermaid from "svelte-highlight/languages/mermaid";
  import modelfile from "svelte-highlight/languages/modelfile";
  import mojo from "svelte-highlight/languages/mojo";
  import move from "svelte-highlight/languages/move";
  import nickel from "svelte-highlight/languages/nickel";
  import nushell from "svelte-highlight/languages/nushell";
  import odin from "svelte-highlight/languages/odin";
  import pkl from "svelte-highlight/languages/pkl";
  import polar from "svelte-highlight/languages/polar";
  import prisma from "svelte-highlight/languages/prisma";
  import promql from "svelte-highlight/languages/promql";
  import prql from "svelte-highlight/languages/prql";
  import pug from "svelte-highlight/languages/pug";
  import purescript from "svelte-highlight/languages/purescript";
  import racket from "svelte-highlight/languages/racket";
  import raku from "svelte-highlight/languages/raku";
  import razor from "svelte-highlight/languages/razor";
  import rego from "svelte-highlight/languages/rego";
  import rescript from "svelte-highlight/languages/rescript";
  import roc from "svelte-highlight/languages/roc";
  import rpmspec from "svelte-highlight/languages/rpmspec";
  import rst from "svelte-highlight/languages/rst";
  import slint from "svelte-highlight/languages/slint";
  import smithy from "svelte-highlight/languages/smithy";
  import snort from "svelte-highlight/languages/snort";
  import solidity from "svelte-highlight/languages/solidity";
  import sparql from "svelte-highlight/languages/sparql";
  import splunk from "svelte-highlight/languages/splunk";
  import starlark from "svelte-highlight/languages/starlark";
  import surrealql from "svelte-highlight/languages/surrealql";
  import templ from "svelte-highlight/languages/templ";
  import toml from "svelte-highlight/languages/toml";
  import traceql from "svelte-highlight/languages/traceql";
  import tsq from "svelte-highlight/languages/tsq";
  import tsrx from "svelte-highlight/languages/tsrx";
  import typespec from "svelte-highlight/languages/typespec";
  import typst from "svelte-highlight/languages/typst";
  import uiua from "svelte-highlight/languages/uiua";
  import unison from "svelte-highlight/languages/unison";
  import v from "svelte-highlight/languages/v";
  import verse from "svelte-highlight/languages/verse";
  import vrl from "svelte-highlight/languages/vrl";
  import vyper from "svelte-highlight/languages/vyper";
  import wgsl from "svelte-highlight/languages/wgsl";
  import wit from "svelte-highlight/languages/wit";
  import yang from "svelte-highlight/languages/yang";
  import yara from "svelte-highlight/languages/yara";
  import zig from "svelte-highlight/languages/zig";

  /** @type {"solidity" | "hcl" | "zig" | "prisma" | "toml" | "fish" | "nushell" | "gleam" | "json5" | "jsonc" | "dotenv" | "groq" | "wgsl" | "cypher" | "promql" | "bicep" | "rescript" | "starlark" | "move" | "cairo" | "vyper" | "clarity" | "cue" | "jsonnet" | "dhall" | "pkl" | "nickel" | "pug" | "razor" | "v" | "odin" | "caddy" | "d2" | "bibtex" | "jq" | "kql" | "logql" | "rego" | "dax" | "typst" | "rst" | "templ" | "hlsl" | "just" | "gdscript" | "heex" | "sparql" | "prql" | "flux" | "cql" | "tsrx" | "angular" | "mermaid" | "kdl" | "earthfile" | "luau" | "polar" | "cedar" | "esql" | "traceql" | "jinja" | "wit" | "surrealql" | "hurl" | "mojo" | "assemblyscript" | "purescript" | "lean" | "agda" | "idris" | "racket" | "fennel" | "jsonata" | "jmespath" | "cel" | "datalog" | "splunk" | "vrl" | "civet" | "imba" | "slint" | "ejs" | "gotmpl" | "helm" | "blueprint" | "kv" | "baml" | "modelfile" | "gbnf" | "tsq" | "verse" | "roc" | "c3" | "bend" | "uiua" | "bqn" | "raku" | "koka" | "unison" | "kcl" | "typespec" | "smithy" | "yara" | "snort" | "codeql" | "cisco" | "yang" | "bpftrace" | "dtrace" | "rpmspec" | "bitbake" | "kconfig"} */
  export let language;

  const registry = {
    solidity: { lang: solidity, snippets: solidityPreviewSnippets },
    sparql: { lang: sparql, snippets: sparqlPreviewSnippets },
    hcl: { lang: hcl, snippets: hclPreviewSnippets },
    heex: { lang: heex, snippets: heexPreviewSnippets },
    zig: { lang: zig, snippets: zigPreviewSnippets },
    prisma: { lang: prisma, snippets: prismaPreviewSnippets },
    toml: { lang: toml, snippets: tomlPreviewSnippets },
    fish: { lang: fish, snippets: fishPreviewSnippets },
    nushell: { lang: nushell, snippets: nushellPreviewSnippets },
    gleam: { lang: gleam, snippets: gleamPreviewSnippets },
    gdscript: { lang: gdscript, snippets: gdscriptPreviewSnippets },
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
    just: { lang: just, snippets: justPreviewSnippets },
    prql: { lang: prql, snippets: prqlPreviewSnippets },
    flux: { lang: flux, snippets: fluxPreviewSnippets },
    cql: { lang: cql, snippets: cqlPreviewSnippets },
    tsrx: { lang: tsrx, snippets: tsrxPreviewSnippets },
    angular: { lang: angular, snippets: angularPreviewSnippets },
    mermaid: { lang: mermaid, snippets: mermaidPreviewSnippets },
    kdl: { lang: kdl, snippets: kdlPreviewSnippets },
    earthfile: { lang: earthfile, snippets: earthfilePreviewSnippets },
    luau: { lang: luau, snippets: luauPreviewSnippets },
    polar: { lang: polar, snippets: polarPreviewSnippets },
    cedar: { lang: cedar, snippets: cedarPreviewSnippets },
    esql: { lang: esql, snippets: esqlPreviewSnippets },
    traceql: { lang: traceql, snippets: traceqlPreviewSnippets },
    jinja: { lang: jinja, snippets: jinjaPreviewSnippets },
    wit: { lang: wit, snippets: witPreviewSnippets },
    surrealql: { lang: surrealql, snippets: surrealqlPreviewSnippets },
    hurl: { lang: hurl, snippets: hurlPreviewSnippets },
    mojo: { lang: mojo, snippets: mojoPreviewSnippets },
    assemblyscript: {
      lang: assemblyscript,
      snippets: assemblyscriptPreviewSnippets,
    },
    purescript: { lang: purescript, snippets: purescriptPreviewSnippets },
    lean: { lang: lean, snippets: leanPreviewSnippets },
    agda: { lang: agda, snippets: agdaPreviewSnippets },
    idris: { lang: idris, snippets: idrisPreviewSnippets },
    racket: { lang: racket, snippets: racketPreviewSnippets },
    fennel: { lang: fennel, snippets: fennelPreviewSnippets },
    jsonata: { lang: jsonata, snippets: jsonataPreviewSnippets },
    jmespath: { lang: jmespath, snippets: jmespathPreviewSnippets },
    cel: { lang: cel, snippets: celPreviewSnippets },
    datalog: { lang: datalog, snippets: datalogPreviewSnippets },
    splunk: { lang: splunk, snippets: splunkPreviewSnippets },
    vrl: { lang: vrl, snippets: vrlPreviewSnippets },
    civet: { lang: civet, snippets: civetPreviewSnippets },
    imba: { lang: imba, snippets: imbaPreviewSnippets },
    slint: { lang: slint, snippets: slintPreviewSnippets },
    ejs: { lang: ejs, snippets: ejsPreviewSnippets },
    gotmpl: { lang: gotmpl, snippets: gotmplPreviewSnippets },
    helm: { lang: helm, snippets: helmPreviewSnippets },
    blueprint: { lang: blueprint, snippets: blueprintPreviewSnippets },
    kv: { lang: kv, snippets: kvPreviewSnippets },
    baml: { lang: baml, snippets: bamlPreviewSnippets },
    modelfile: { lang: modelfile, snippets: modelfilePreviewSnippets },
    gbnf: { lang: gbnf, snippets: gbnfPreviewSnippets },
    tsq: { lang: tsq, snippets: tsqPreviewSnippets },
    verse: { lang: verse, snippets: versePreviewSnippets },
    roc: { lang: roc, snippets: rocPreviewSnippets },
    c3: { lang: c3, snippets: c3PreviewSnippets },
    bend: { lang: bend, snippets: bendPreviewSnippets },
    uiua: { lang: uiua, snippets: uiuaPreviewSnippets },
    bqn: { lang: bqn, snippets: bqnPreviewSnippets },
    raku: { lang: raku, snippets: rakuPreviewSnippets },
    koka: { lang: koka, snippets: kokaPreviewSnippets },
    unison: { lang: unison, snippets: unisonPreviewSnippets },
    kcl: { lang: kcl, snippets: kclPreviewSnippets },
    typespec: { lang: typespec, snippets: typespecPreviewSnippets },
    smithy: { lang: smithy, snippets: smithyPreviewSnippets },
    yara: { lang: yara, snippets: yaraPreviewSnippets },
    snort: { lang: snort, snippets: snortPreviewSnippets },
    codeql: { lang: codeql, snippets: codeqlPreviewSnippets },
    cisco: { lang: cisco, snippets: ciscoPreviewSnippets },
    yang: { lang: yang, snippets: yangPreviewSnippets },
    bpftrace: { lang: bpftrace, snippets: bpftracePreviewSnippets },
    dtrace: { lang: dtrace, snippets: dtracePreviewSnippets },
    rpmspec: { lang: rpmspec, snippets: rpmspecPreviewSnippets },
    bitbake: { lang: bitbake, snippets: bitbakePreviewSnippets },
    kconfig: { lang: kconfig, snippets: kconfigPreviewSnippets },
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
