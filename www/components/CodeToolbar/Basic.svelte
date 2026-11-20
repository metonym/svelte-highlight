<script>
  import { THEME_MODULE_NAME, THEME_NAME } from "@www/constants";
  import Highlight, {
    CodeToolbar,
    CopyButton,
    HighlightSvelte,
    LineNumbers,
    WrapToggle,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { sample as code } from "./sample.js";

  const snippet = `<script>
  import Highlight, {
    CodeToolbar,
    CopyButton,
    LineNumbers,
    WrapToggle,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  export let code;

  let wrap = false;
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<div class="code-block">
  <Highlight language={typescript} {code} {wrap} let:highlighted let:languageName>
    <CodeToolbar {languageName} title="config.ts" label="config.ts actions">
      <WrapToggle bind:wrap />
      <CopyButton {code} />
    </CodeToolbar>
    <LineNumbers {highlighted} wrapLines={wrap} style="max-height: 24rem" />
  </Highlight>
</div>

<style>
  .code-block {
    border-radius: 8px;
    overflow: clip;
  }
</style>`;

  let wrap = false;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<div class="code-block {THEME_MODULE_NAME}">
  <Highlight
    language={typescript}
    {code}
    {wrap}
    let:highlighted
    let:languageName
  >
    <CodeToolbar {languageName} title="config.ts" label="config.ts actions">
      <WrapToggle bind:wrap />
      <CopyButton {code} />
    </CodeToolbar>
    <LineNumbers {highlighted} wrapLines={wrap} style="max-height: 24rem" />
  </Highlight>
</div>

<style>
  .code-block {
    border-radius: 8px;
    overflow: clip;
  }
</style>
