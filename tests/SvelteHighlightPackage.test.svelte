<script lang="ts">
  import Highlight, {
    CopyButton,
    HighlightAuto,
    LineNumbers,
  } from "../package";
  import Highlight2 from "../package/Highlight.svelte";
  import { typescript } from "../package/languages";
  import javascript from "../package/languages/javascript";
  import typescriptDefault, {
    typescript as ts,
  } from "../package/languages/typescript";
  import githubStyles from "../package/styles/github";
  import { _3024, github, purebasic } from "../package/styles/index";
  import "../package/styles/3024.css";

  const highlightLanguage = javascript || typescript || typescriptDefault || ts;
</script>

<Highlight
  class=""
  code=""
  language={highlightLanguage}
  on:highlight={(e) => {
    console.log(e.detail);
  }}
  let:highlighted
>
  {@html highlighted}
</Highlight>

<svelte:component this={Highlight2} code="" language={typescript} />

{_3024}
{github}
{githubStyles}
{purebasic}

<Highlight language={typescript} code="" let:highlighted>
  <LineNumbers
    {highlighted}
    hideBorder
    wrapLines
    --line-number-color="pink"
    --border-color="rgba(255, 255, 255, 0.2)"
    --padding-left={0}
    --padding-right="1em"
  />
</Highlight>

<HighlightAuto
  code=""
  on:highlight={(e) => {
    console.log(e.detail.language);
  }}
/>

<div style="position: relative">
  <Highlight language={typescript} code="" />
  <CopyButton
    code=""
    timeout={3000}
    text="Copy"
    copiedText="Copied!"
    copy={(code) => navigator.clipboard.writeText(code)}
    on:copy={(e) => {
      console.log(e.detail.code);
    }}
    on:error={(e) => {
      console.error(e.detail.error);
    }}
    --copy-top="0.5em"
    --copy-right="0.5em"
    --copy-size="2em"
    --copy-padding="0.5em"
    --copy-background="inherit"
    --copy-color="inherit"
    --copy-border-radius="4px"
    --copy-border="none"
    --copy-z-index={2}
    let:copied
    let:copying
  >
    {copying ? "…" : copied ? "Copied!" : "Copy"}
  </CopyButton>
</div>

<Highlight
  code=""
  language={javascript}
  langtag
  --langtag-background=""
  --langtag-border-radius=""
  --langtag-color=""
  --langtag-padding=""
  --langtag-top=""
  --langtag-right=""
/>
