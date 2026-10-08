<script>
  import Annotations from "@components/HighlightDiff/Annotations.svelte";
  import Composition from "@components/HighlightDiff/Composition.svelte";
  import CrossHunk from "@components/HighlightDiff/CrossHunk.svelte";
  import EdgeCases from "@components/HighlightDiff/EdgeCases.svelte";
  import EditFormats from "@components/HighlightDiff/EditFormats.svelte";
  import GitHistory from "@components/HighlightDiff/GitHistory.svelte";
  import Headless from "@components/HighlightDiff/Headless.svelte";
  import Languages from "@components/HighlightDiff/Languages.svelte";
  import LargeFile from "@components/HighlightDiff/LargeFile.svelte";
  import MovesWhitespace from "@components/HighlightDiff/MovesWhitespace.svelte";
  import Playground from "@components/HighlightDiff/Playground.svelte";
  import StreamingEdits from "@components/HighlightDiff/StreamingEdits.svelte";
  import StreamingRewrite from "@components/HighlightDiff/StreamingRewrite.svelte";
  import { Column, Row } from "carbon-components-svelte";

  const sections = [
    ["Playground", Playground],
    ["Live: an AI rewrites a file", StreamingRewrite],
    ["Live: SEARCH/REPLACE output applied as it streams", StreamingEdits],
    ["LLM edit formats, fuzzy apply, and review", EditFormats],
    ["Git history viewer (patch-only input)", GitHistory],
    ["Composition: FileTabs + DiffView + DiffStats", Composition],
    ["Highlighting stays correct across hunks", CrossHunk],
    ["Moves and whitespace", MovesWhitespace],
    ["Review annotations (custom slots)", Annotations],
    ["Large file", LargeFile],
    ["Languages", Languages],
    ["Edge cases", EdgeCases],
    ["Headless API", Headless],
  ];

  // `?only=3` renders one section, for isolating a demo.
  const only = new URLSearchParams(location.search).get("only");
</script>

<nav class="mb-7">
  {#each sections as [title], i}
    <a href="#diff-{i}">{title}</a>
  {/each}
</nav>

{#each sections as [title, component], i}
  {#if only === null || Number(only) === i}
    <Row class="mb-9">
      <Column xlg={16}><h3 id="diff-{i}" class="mb-5">{title}</h3></Column>
      <Column xlg={16}><svelte:component this={component} /></Column>
    </Row>
  {/if}
{/each}

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
  }

  nav a {
    color: #78a9ff;
  }
</style>
