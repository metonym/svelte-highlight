<script>
  import Basic from "./Basic.svelte";

  const snippet = `<LineNumbers
    {highlighted}
    lineStates={{ 1: "added", 2: "removed" }}
  />`;
</script>

<Basic {snippet} lineStates={{ 1: "added", 2: "removed" }} />
