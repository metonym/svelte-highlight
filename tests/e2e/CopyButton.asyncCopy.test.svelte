<script lang="ts">
  import Highlight, { CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b;";

  let count = 0;

  /** A slow async copy to exercise the in-flight dedup guard. */
  function copy() {
    count += 1;
    return new Promise<void>((resolve) => setTimeout(resolve, 500));
  }
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<div style="position: relative">
  <Highlight language={typescript} {code} />
  <CopyButton {code} {copy} timeout={1000} let:copying>
    {#if copying}
      <span data-testid="pending">…</span>
    {/if}
  </CopyButton>
</div>

<output data-testid="count">{count}</output>
