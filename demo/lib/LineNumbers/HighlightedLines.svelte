<script>
  // @ts-check
  import Basic from "./Basic.svelte";

  const snippet = "<LineNumbers {highlighted} highlightedLines={[0, 2, 3, 14]} />";
</script>

<Basic {snippet} highlightedLines={[0, 2, 3, 14]} />
