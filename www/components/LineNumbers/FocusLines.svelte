<script>
  import Basic from "./Basic.svelte";

  const snippet = `<LineNumbers
    {highlighted}
    highlightedLines={[0, 2, 3, 14]}
    --unhighlighted-opacity="0.4"
  />`;
</script>

<Basic
  {snippet}
  highlightedLines={[0, 2, 3, 14]}
  --unhighlighted-opacity="0.4"
/>
