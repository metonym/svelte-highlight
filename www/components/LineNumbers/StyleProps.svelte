<script>
  // @ts-check
  import Basic from "./Basic.svelte";

  const snippet = `<LineNumbers
    {highlighted}
    --line-number-color="pink"
    --border-color="rgba(255, 255, 255, 0.2)"
    --padding-left={0}
    --padding-right="1em"
  />`;
</script>

<Basic
  {snippet}
  --line-number-color="pink"
  --border-color="rgba(255, 255, 255, 0.2)"
  --padding-left={0}
  --padding-right="1em"
/>
