<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { HighlightDiff } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import { edgeCases } from "./samples.js";

  /** @type {"unified" | "split"} */
  let view = "unified";
</script>

<button
  type="button"
  class="toggle"
  on:click={() => (view = view === "split" ? "unified" : "split")}
>
  View: {view}
</button>

<div class="grid">
  {#each edgeCases as edge}
    <div>
      <h6>{edge.label}</h6>
      <HighlightDiff
        before={edge.before}
        after={edge.after}
        language={javascript}
        {view}
        minimap={false}
        class={THEME_MODULE_NAME}
        style="height: 130px"
      />
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 1.25rem;
  }

  h6 {
    margin-bottom: 0.25rem;
  }

  .toggle {
    margin-bottom: 1rem;
    background: #393939;
    color: inherit;
    border: 0;
    padding: 4px 10px;
    cursor: pointer;
  }
</style>
