<script lang="ts">
  import { HighlightDiff } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import horizonDark from "svelte-highlight/styles/horizon-dark";

  export let diff: string | undefined = undefined;
  export let before: string | undefined = undefined;
  export let after: string | undefined = undefined;
  export let context: number | undefined = undefined;
  export let gutter: "both" | "new" | "unified" | "none" | undefined =
    undefined;
</script>

<svelte:head> {@html horizonDark} </svelte:head>

<HighlightDiff
  {diff}
  {before}
  {after}
  {context}
  {gutter}
  language={typescript}
/>
