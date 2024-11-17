<script lang="ts">
  import Highlight from "../package";
  import Highlight2 from "../package/Highlight.svelte";
  import { HighlightAuto, LineNumbers, ScopedStyle } from "../package";
  import _1cLightScoped from "../package/styles/1c-light.scoped";
  import { typescript } from "../package/languages";
  import typescriptDefault from "../package/languages/typescript";
  import { typescript as ts } from "../package/languages/typescript";
  import javascript from "../package/languages/javascript";
  import { github, purebasic, _3024 } from "../package/styles/index";
  import githubStyles from "../package/styles/github";
  import "../package/styles/3024.css";
</script>

<Highlight
  class=""
  code=""
  language={javascript || typescript || typescriptDefault || ts}
  on:highlight={(e) => {
    console.log(e.detail);
  }}
  let:highlighted
>
  {@html highlighted}
</Highlight>

<svelte:component this={Highlight2} code="" language={typescript} />

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

<ScopedStyle {..._1cLightScoped}>
  <Highlight code="" language={javascript} />
</ScopedStyle>
