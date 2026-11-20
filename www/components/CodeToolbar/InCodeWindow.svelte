<script>
  import { THEME_MODULE_NAME, THEME_NAME } from "@www/constants";
  import Highlight, {
    CodeToolbar,
    CodeWindow,
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
    CodeWindow,
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

<CodeWindow variant="macos" title="config.ts">
  <Highlight language={typescript} {code} {wrap} let:highlighted let:languageName>
    <CodeToolbar {languageName}>
      <WrapToggle bind:wrap />
      <CopyButton {code} />
    </CodeToolbar>
    <LineNumbers {highlighted} wrapLines={wrap} />
  </Highlight>
</CodeWindow>`;

  let wrap = false;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<div class={THEME_MODULE_NAME}>
  <CodeWindow variant="macos" title="config.ts">
    <Highlight
      language={typescript}
      {code}
      {wrap}
      let:highlighted
      let:languageName
    >
      <CodeToolbar {languageName}>
        <WrapToggle bind:wrap />
        <CopyButton {code} />
      </CodeToolbar>
      <LineNumbers {highlighted} wrapLines={wrap} />
    </Highlight>
  </CodeWindow>
</div>
