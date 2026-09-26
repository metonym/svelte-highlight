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

  const code = Array.from(
    { length: 60 },
    (_, i) => `const line${i} = ${i};`,
  ).join("\n");

  const snippet = `<script>
  import Highlight, {
    CodeToolbar,
    CopyButton,
    LineNumbers,
    WrapToggle,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  const code = "..."; // a long file

  let wrap = false;
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<!-- CodeToolbar's sticky positioning pins it to this scrolling container. -->
<div style="max-height: 320px; overflow-y: auto;">
  <Highlight language={typescript} {code} {wrap} let:highlighted let:languageName>
    <CodeToolbar {languageName} title="app.ts">
      <WrapToggle bind:wrap />
      <CopyButton {code} absolute={false} />
    </CodeToolbar>
    <LineNumbers {highlighted} wrapLines={wrap} />
  </Highlight>
</div>`;

  let wrap = false;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<div style="max-height: 320px; overflow-y: auto;">
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
</div>
