<script>
  import "svelte-highlight/styles/atom-one-dark.css";
  import { HighlightAutoLazy } from "svelte-highlight";

  const code = "@media (max-width: 600px) {\n  body { background: #000; }\n}";
</script>

<HighlightAutoLazy {code} langtag />
