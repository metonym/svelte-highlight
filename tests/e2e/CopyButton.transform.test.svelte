<script lang="ts">
  import { CopyButton, stripPrompts } from "svelte-highlight";

  const code = "$ npm i\nadded 1 package";

  let detail = "";

  function onCopy(e: CustomEvent<{ code: string }>) {
    detail = e.detail.code;
  }
</script>

<div style="position: relative">
  <CopyButton {code} transform={stripPrompts} timeout={1000} on:copy={onCopy} />
</div>

<output data-testid="detail">{detail}</output>
