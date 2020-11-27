<script>
  /**
   * @restProps {'pre'}
   * @extends {"./HighlightSvelte"} HighlightSvelteProps
   * @event {string} highlight
   */
  export let code = "";

  /**
   * @typedef {{svelteSortOrder?: "scripts-styles-markup" | "markup-styles-scripts" | "styles-markup-scripts"; svelteStrictMode?: boolean; svelteAllowShorthand?: boolean; svelteBracketNewLine?: boolean; svelteIndentScriptAndStyle?: boolean; }} PrettierSvelteOptions
   */

  /**
   * Prettier options
   * @type {import("prettier").Options & PrettierSvelteOptions}
   */
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
