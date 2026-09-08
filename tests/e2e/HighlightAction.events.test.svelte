<script lang="ts">
  import { highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  let language: any = typescript;
  let lastEvent = "";

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
</script>

<button type="button" on:click={() => (language = broken)}>Break</button>
<pre><code
    use:highlight={{ language, code: "const add = (a, b) => a + b;" }}
    on:highlighted={() => (lastEvent = "highlighted")}
    on:error={() => (lastEvent = "error")}
  ></code></pre>
<p data-testid="last-event">{lastEvent}</p>
