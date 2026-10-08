<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import {
    Button,
    Select,
    SelectItem,
    TextArea,
  } from "carbon-components-svelte";
  import { applyEdits, HighlightDiff, parseEdits } from "svelte-highlight";
  import python from "svelte-highlight/languages/python";
  import { editSamples, editSource } from "./samples.js";

  let sampleIndex = "0";
  let source = editSource;
  let output = editSamples[0]?.text ?? "";
  $: output = editSamples[Number(sampleIndex)]?.text ?? "";

  $: parsed = parseEdits(output);
  $: applied = applyEdits(source, parsed.edits);

  /** @type {HighlightDiff} */
  let ref;
  let reviewed = "";
  let decided = 0;

  $: void applied, (reviewed = ""), (decided = 0);
</script>

<div class="controls">
  <Select inline size="sm" labelText="Model output" bind:selected={sampleIndex}>
    {#each editSamples as sample, i}
      <SelectItem value={String(i)} text={sample.label} />
    {/each}
  </Select>
  <span class="label-01"
    >detected format: <code class="code">{parsed.format}</code></span
  >
</div>

<div class="inputs">
  <TextArea labelText="Source file (app.py)" rows={10} bind:value={source} />
  <TextArea labelText="Model output (edit it)" rows={10} bind:value={output} />
</div>

<table class="results">
  <thead>
    <tr>
      <th>#</th>
      <th>Status</th>
      <th>Strategy</th>
      <th>Score</th>
      <th>Lines</th>
      <th>Note</th>
    </tr>
  </thead>
  <tbody>
    {#each applied.results as result, i}
      <tr class:failed={result.status === "failed"}>
        <td>{i + 1}</td>
        <td>{result.status}</td>
        <td>{result.strategy ?? "—"}</td>
        <td>{result.score === undefined ? "—" : result.score.toFixed(2)}</td>
        <td>
          {result.start === undefined
            ? "—"
            : `${result.start + 1}–${result.end}`}
        </td>
        <td>{result.reason ?? ""}</td>
      </tr>
    {:else}
      <tr>
        <td colspan="6">No edits found.</td>
      </tr>
    {/each}
  </tbody>
</table>

<div class="controls">
  <Button
    size="small"
    kind="tertiary"
    on:click={() => ref.decideAll("accepted")}
    >Accept all</Button
  >
  <Button
    size="small"
    kind="tertiary"
    on:click={() => ref.decideAll("rejected")}
    >Reject all</Button
  >
  <span class="label-01">
    {decided}
    decided. Keyboard: <kbd>n</kbd>/<kbd>p</kbd>
    to move, <kbd>a</kbd> accept,
    <kbd>r</kbd>
    reject, <kbd>u</kbd> undo.
  </span>
</div>

<HighlightDiff
  bind:this={ref}
  before={source}
  after={applied.text}
  language={python}
  review
  class={THEME_MODULE_NAME}
  style="height: 360px"
  on:review={(e) => {
    reviewed = e.detail.text;
    decided = e.detail.decisions.size;
  }}
/>

{#if reviewed}
  <p class="label-01 mt">Result after review (rejected changes reverted):</p>
  <pre class="final">{reviewed}</pre>
{/if}

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1rem 1.5rem;
    margin: 1rem 0;
  }

  .inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .inputs :global(textarea) {
    font-family: monospace;
    font-size: 12px;
  }

  .results {
    margin-top: 1rem;
    border-collapse: collapse;
    font-size: 13px;
  }

  .results th,
  .results td {
    padding: 4px 12px;
    text-align: left;
    border-bottom: 1px solid #393939;
  }

  .failed {
    color: #ff8389;
  }

  .mt {
    margin-top: 1rem;
  }

  .final {
    font-family: ui-monospace, Menlo, monospace;
    max-height: 240px;
    overflow: auto;
    padding: 0.75rem;
    background: #161616;
    font-size: 12px;
  }

  kbd {
    font-family: monospace;
    padding: 0 4px;
    border: 1px solid #555;
    border-radius: 3px;
  }
</style>
