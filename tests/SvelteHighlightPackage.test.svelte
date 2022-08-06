<script lang="ts">
  import Highlight from "../package";
  import Highlight2 from "../package/Highlight.svelte";
  import { typescript } from "../package/languages";
  import typescriptDefault from "../package/languages/typescript";
  import { typescript as ts } from "../package/languages/typescript";
  import javascript from "../package/languages/javascript";
  import { github, purebasic, _3024 } from "../package/styles/index";
  import githubStyles from "../package/styles/github";
  import "../package/styles/3024.css";
</script>

<Highlight
  code=""
  language={javascript || typescript || typescriptDefault || ts}
  on:highlight={(e) => {
    console.log(e.detail);
  }}
  let:highlighted
>
  {@html highlighted}
</Highlight>

<svelte:component this={Highlight2} />

{github}
{githubStyles}
{purebasic}
