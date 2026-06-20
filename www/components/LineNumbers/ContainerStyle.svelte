<script>
  import Basic from "./Basic.svelte";

  const snippet = `<LineNumbers
    {highlighted}
    --border-radius="8px"
    --max-width="24rem"
  />`;
</script>

<Basic {snippet} --border-radius="8px" --max-width="24rem" />
