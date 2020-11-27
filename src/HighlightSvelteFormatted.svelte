<script>
  export let code = "";
  export let prettier = {};

  import HighlightSvelte from "./HighlightSvelte.svelte";
  import { format } from "prettier";
  import parserTypescript from "prettier/parser-typescript";
  import * as parserSvelte from "prettier-plugin-svelte";

  $: formattedCode = format(code, {
    ...prettier,
    parser: "svelte",
    plugins: [parserSvelte, parserTypescript],
  });
</script>

<HighlightSvelte {...$$restProps} code="{formattedCode}" on:highlight />
