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

  const code = "const add = (a: number, b: number) => a + b;";

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

  const code = "const add = (a: number, b: number) => a + b";

  let wrap = false;
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<CodeWindow variant="macos" title="example.ts">
  <Highlight language={typescript} {code} {wrap} let:highlighted let:languageName>
    <CodeToolbar {languageName} title="app.ts">
      <WrapToggle bind:wrap />
      <CopyButton {code} absolute={false} />
    </CodeToolbar>
    <LineNumbers {highlighted} wrapLines={wrap} />
  </Highlight>
</CodeWindow>`;

  let wrap = false;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<CodeWindow variant="macos" title="example.ts">
  <Highlight
    language={typescript}
    {code}
    {wrap}
    let:highlighted
    let:languageName
  >
    <CodeToolbar {languageName} title="app.ts">
      <WrapToggle bind:wrap />
      <CopyButton {code} absolute={false} />
    </CodeToolbar>
    <LineNumbers {highlighted} wrapLines={wrap} class={THEME_MODULE_NAME} />
  </Highlight>
</CodeWindow>
