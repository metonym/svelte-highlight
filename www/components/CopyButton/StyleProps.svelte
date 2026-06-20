<script>
  import Basic from "./Basic.svelte";

  const snippet = `<CopyButton
    {code}
    --copy-background="rgba(255, 255, 255, 0.1)"
    --copy-color="#fff"
    --copy-border-radius="8px"
    --copy-size="2.5em"
  />`;
</script>

<Basic
  {snippet}
  --copy-background="rgba(255, 255, 255, 0.1)"
  --copy-color="#fff"
  --copy-border-radius="8px"
  --copy-size="2.5em"
/>
