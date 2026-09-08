<script lang="ts">
  import { onMount } from "svelte";
  import { createWorkerHighlighter } from "svelte-highlight/worker";

  // 14,000 lines joins to just over 1,000,000 characters.
  const LINE_COUNT = 14000;

  function makeCode(): string {
    return Array.from(
      { length: LINE_COUNT },
      (_, i) =>
        `function fn${i}(a: number, b: number): number {\n  return a + b + ${i};\n}\n`,
    ).join("\n");
  }

  let value = "";
  let done = false;
  let elapsedMs = 0;
  let styles: string;

  onMount(async () => {
    styles = (await import("svelte-highlight/styles/atom-one-dark")).default;

    const code = makeCode();
    const worker = new Worker(
      new URL("./highlight.worker.js", import.meta.url),
      { type: "module" },
    );
    const highlighter = createWorkerHighlighter(worker);

    const start = performance.now();
    const timer = setInterval(() => {
      elapsedMs = performance.now() - start;
    }, 50);

    const result = await highlighter.highlight(code, "typescript");
    clearInterval(timer);
    value = result.value;
    done = true;
  });
</script>

<svelte:head>
  {#if styles}
    {@html styles}
  {/if}
</svelte:head>

{#if !done}
  <p>
    Highlighting a ~1 MB file in a Worker… {Math.round(elapsedMs)}ms elapsed.
    This counter keeps ticking on the main thread the whole time, proving
    it's not blocked.
  </p>
{:else}
  <pre class="hljs"><code>{@html value}</code></pre>
{/if}
