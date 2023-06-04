<script lang="ts">
  import Highlight, {
    HighlightAuto,
    HighlightSvelte,
    LineNumbers,
  } from "svelte-highlight";
  import Highlight2 from "svelte-highlight/Highlight.svelte";
  import { typescript } from "svelte-highlight/languages";
  import javascript from "svelte-highlight/languages/javascript";
  import { github, purebasic, _3024 } from "svelte-highlight/styles/index";
  import "svelte-highlight/styles/3024.css";

  let toggled = true;
  let highlighted = "";
  let language = "";

  $: code = "const add = (a: number, b: number) => a + b;";
  $: codeSvelte = "<button on:click>Click me</button>";
</script>

<svelte:head>
  {@html github}
  {@html purebasic}
  {@html _3024}
</svelte:head>

<button on:click={() => (toggled = !toggled)}>Toggle</button>

<HighlightAuto
  class=""
  id="highlight-auto"
  code={toggled ? code : codeSvelte}
  langtag={true}
  --langtag-background=""
  --langtag-color=""
  --langtag-border-radius=""
/>

<HighlightAuto
  id="highlight-auto-css"
  code={`body {\n  padding: 0;\n  color: red;\n}`}
  langtag={true}
  on:highlight={(e) => {
    language = e.detail.language;
  }}
/>

<div id="inferred-language">{language}</div>

<Highlight
  language={toggled ? javascript : typescript}
  {code}
  langtag={true}
  on:highlight={(e) => {
    highlighted = e.detail.highlighted;
  }}
  let:highlighted
>
  {@html highlighted}
</Highlight>

<HighlightSvelte id="langtag" code={codeSvelte} langtag={true} on:highlight />

<Highlight2
  code="123"
  language={{
    name: "custom-lang",
    register: (hljs) => {
      return {
        contains: [],
      };
    },
  }}
/>

<div id="highlighted">{highlighted}</div>

<div id="line-numbers">
  <Highlight language={typescript} code="" let:highlighted>
    <LineNumbers {highlighted} />
  </Highlight>
</div>
