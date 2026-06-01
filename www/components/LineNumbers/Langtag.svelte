<script>
  import { THEME_MODULE_NAME, THEME_NAME } from "@www/constants";

  import { HighlightSvelte, LineNumbers } from "svelte-highlight";

  const code = `<script>
  import { HighlightSvelte, LineNumbers } from "svelte-highlight";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  const code = "const add = (a: number, b: number) => a + b";
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<HighlightSvelte {code} langtag let:highlighted let:langtag let:languageName>
  <LineNumbers {highlighted} {langtag} {languageName} />
</HighlightSvelte>`;
</script>

<HighlightSvelte {code} langtag let:highlighted let:langtag let:languageName>
  <LineNumbers
    class={THEME_MODULE_NAME}
    {highlighted}
    {langtag}
    {languageName}
  />
</HighlightSvelte>
