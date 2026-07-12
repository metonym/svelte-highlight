<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";

  const code = "const a = 1;";
</script>

<div data-testid="one">
  <Highlight
    language={typescript}
    {code}
    engine="css-highlights"
    theme={github}
  />
</div>
<div data-testid="two">
  <Highlight
    language={typescript}
    {code}
    engine="css-highlights"
    theme={atomOneDark}
  />
</div>
