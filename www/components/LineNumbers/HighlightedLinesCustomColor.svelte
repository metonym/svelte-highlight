<script>
  // @ts-check

  import Basic from "./Basic.svelte";

  const snippet = `<LineNumbers
    {highlighted}
    highlightedLines={[16]}
    --highlighted-background="rgba(150, 203, 254, 0.2)"
  />`;
</script>

<Basic
  {snippet}
  highlightedLines={[16]}
  --highlighted-background="rgba(150, 203, 254, 0.2)"
/>
