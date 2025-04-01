<script>
  import Basic from "./Basic.svelte";

  const snippet = "<LineNumbers {highlighted} startingLineNumber={42} />";
</script>

<Basic {snippet} startingLineNumber={42} />
