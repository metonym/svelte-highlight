<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import css from "svelte-highlight/languages/css";
  import json from "svelte-highlight/languages/json";
  import markdown from "svelte-highlight/languages/markdown";
  import python from "svelte-highlight/languages/python";
  import rust from "svelte-highlight/languages/rust";
  import yaml from "svelte-highlight/languages/yaml";
  import { languageSamples } from "./samples.js";

  /** @type {Record<string, any>} */
  const modules = { python, rust, css, json, yaml, markdown };
  const names = Object.keys(languageSamples);
  let active = names[0] ?? "python";
  $: [before, after] = /** @type {Record<string, [string, string]>} */ (
    languageSamples
  )[active] ?? ["", ""];
</script>

<div class="tabs">
  {#each names as name}
    <button
      type="button"
      class:active={name === active}
      on:click={() => (active = name)}
    >
      {name}
    </button>
  {/each}
</div>

<HighlightDiff
  {before}
  {after}
  language={modules[active]}
  view="split"
  class={THEME_MODULE_NAME}
  style="height: 300px"
/>

<style>
  .tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 0.5rem;
  }

  .tabs button {
    background: #262626;
    color: inherit;
    border: 0;
    padding: 6px 14px;
    cursor: pointer;
  }

  .tabs button.active {
    background: #4589ff;
  }
</style>
