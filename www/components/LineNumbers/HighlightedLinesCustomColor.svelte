<script>
  // @ts-check
  import Basic from "./Basic.svelte";

  const snippet =
    '<LineNumbers {highlighted} highlightedLines={[1, 2]} --highlighted-background="#000" />';
</script>

<Basic {snippet} highlightedLines={[1, 2]} --highlighted-background="#000" />
