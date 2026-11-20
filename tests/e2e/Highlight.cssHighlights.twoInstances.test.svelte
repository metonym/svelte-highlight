<script>
  import Highlight, { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";

  const code = "const a = 1;";
</script>

<Highlight
  language={typescript}
  {code}
  engine="css-highlights"
  theme={github}
/>
<Highlight
  language={typescript}
  {code}
  engine="css-highlights"
  theme={atomOneDark}
/>
<HighlightEditable
  language={typescript}
  {code}
  engine="css-highlights"
  theme={github}
/>
