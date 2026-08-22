<script lang="ts">
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  // A short CSS/JS-ish snippet no longer reliably reaches tier-0's top-5
  // candidates now that HighlightAuto doesn't ship (or eagerly register)
  // every grammar - see the tier-0 recall frontier documented in
  // tests/auto-detect-accuracy.test.ts. This "go" snippet does.
  let code =
    'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hello world")\n}\n';
</script>

<svelte:head> {@html atomOneDark} </svelte:head>

<HighlightAuto {code} langtag />
