<script lang="ts">
  import { Highlight, ScopedStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark.scoped";
  import github from "svelte-highlight/styles/github.scoped";
  import blackMetalDarkFuneral from "svelte-highlight/styles/black-metal-dark-funeral.scoped";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<ScopedStyle {...atomOneDark}>
  <Highlight language={typescript} {code} />
</ScopedStyle>

<ScopedStyle {...github}>
  <Highlight language={typescript} {code} />
</ScopedStyle>

<ScopedStyle {...blackMetalDarkFuneral}>
  <Highlight language={typescript} {code} />
</ScopedStyle>
