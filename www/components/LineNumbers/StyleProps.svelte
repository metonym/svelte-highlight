<script>
  import Basic from "./Basic.svelte";

  const snippet = `<LineNumbers
    {highlighted}
    --line-number-color="rgba(255, 255, 255, 0.3)"
    --border-color="rgba(255, 255, 255, 0.1)"
    --padding-left="2em"
    --padding-right="1em"
  />`;
</script>

<Basic
  {snippet}
  --line-number-color="rgba(255, 255, 255, 0.3)"
  --border-color="rgba(255, 255, 255, 0.1)"
  --padding-left="2em"
  --padding-right="1em"
/>
