<script lang="ts">
  import Highlight from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  export let langtag: boolean = false;
  export let code: string = "";
  export let language: { name: string; register: () => void };
  export let style: string = "";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<Highlight {langtag} {code} {language} {style} />

