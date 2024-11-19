<script lang="ts">
  import { Highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark.scoped";
  import github from "svelte-highlight/styles/github.scoped";
  import blackMetalDarkFuneral from "svelte-highlight/styles/black-metal-dark-funeral.scoped";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head>
  {@html github}
  {@html atomOneDark}
  {@html blackMetalDarkFuneral}
</svelte:head>

<Highlight class="github" language={typescript} {code} />

<Highlight class="atomOneDark" language={typescript} {code} />

<Highlight class="blackMetalDarkFuneral" language={typescript} {code} />
