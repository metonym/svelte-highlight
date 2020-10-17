<script>
  export let text = "";

  import copy from "clipboard-copy";
  import { Button } from "svelte-primer";
  import { Check, Clippy } from "svelte-octicons";
  import { onDestroy } from "svelte";

  let timeout = undefined;
  let copied = false;

  onDestroy(() => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  });

  function copyToClipboard() {
    if (copied) {
      return;
    }

    copied = true;
    copy(text);

    timeout = setTimeout(() => {
      copied = false;
    }, 3000);
  }
</script>

<Button
  variant="octicon"
  class="border-0 border-left"
  style="margin-left: 0; min-width: 2.75rem;"
  on:click="{copyToClipboard}"
>
  <svelte:component this="{copied ? Check : Clippy}" />
</Button>
