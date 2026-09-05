<script lang="ts">
  import { tick } from "svelte";
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let code =
    'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hello world")\n}\n';

  let dispatchCount = 0;
  let lastLanguage = "";

  // Two rapid `code` changes, with a tick (a real reactive flush - and so a
  // real `detectLanguage()` kickoff) between them: the first detection is
  // still in flight (its dynamic import hasn't resolved) when the second
  // one starts. Only the second (latest) should ever apply/dispatch.
  async function triggerRace() {
    dispatchCount = 0;
    code = '#!/bin/bash\nfor f in *.txt; do\n  echo "$f"\ndone\n';
    await tick();
    code =
      'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("race winner")\n}\n';
  }
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightAuto
  {code}
  langtag
  on:highlight={(e) => {
    dispatchCount++;
    lastLanguage = e.detail.language;
  }}
/>

<button type="button" data-testid="trigger-race" on:click={triggerRace}>
  trigger race
</button>
<p data-testid="dispatch-count">{dispatchCount}</p>
<p data-testid="last-language">{lastLanguage}</p>
