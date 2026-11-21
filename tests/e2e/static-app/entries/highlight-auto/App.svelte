<script>
  import "svelte-highlight/styles/atom-one-dark.css";
  import { HighlightAuto } from "svelte-highlight";

  const code = "@media (max-width: 600px) {\n  body { background: #000; }\n}";
</script>

<HighlightAuto {code} langtag />
