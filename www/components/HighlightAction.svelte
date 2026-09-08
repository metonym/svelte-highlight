<script>
  import { THEME_MODULE_NAME, THEME_NAME } from "@www/constants";
  import { HighlightSvelte, highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = "const add = (a, b) => a + b;";

  const snippet = `<script>
  import { highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  const code = "const add = (a, b) => a + b;";
  let status = "";
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<pre><code
  use:highlight={{ language: typescript, code }}
  on:highlighted={() => (status = "highlighted")}
  on:error={() => (status = "error")}
></code></pre>
<p>{status}</p>`;

  const broken = {
    name: "broken-grammar",
    register: {
      name: "broken-grammar",
      caseInsensitive: false,
      unicode: false,
      disableAutodetect: false,
      states: [
        { relevance: 1, rules: [1] },
        { relevance: 1, rules: [], scope: "broken", begin: "(" },
      ],
    },
  };

  const classConventionSnippet = `<pre><code
  class="language-typescript"
  use:highlight
>const add = (a, b) => a + b;</code></pre>`;

  let language = typescript;
  let status = "";
</script>

<HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />

<button type="button" on:click={() => (language = broken)}>
  Break the grammar
</button>
<pre><code
    use:highlight={{ language, code }}
    on:highlighted={() => (status = "highlighted")}
    on:error={() => (status = "error")}
  ></code></pre>
<p>Status: {status}</p>

<HighlightSvelte code={classConventionSnippet} class={THEME_MODULE_NAME} />

<pre><code class="language-typescript" use:highlight
  >const add = (a, b) => a + b;</code
></pre>
