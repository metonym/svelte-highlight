<script>
  /** @type {boolean} */
  export let wrap = false;

  /** @type {string} */
  export let text = "Wrap";

  import ToolbarButton from "./ToolbarButton.svelte";
</script>

<ToolbarButton
  label={text}
  pressed={wrap}
  on:click={() => (wrap = !wrap)}
  {...$$restProps}
>
  <slot {wrap}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="16"
      height="16"
      fill="currentColor"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path d="M4 6h24v2H4z"></path>
      <path
        d="M4 14h19.5a5.5 5.5 0 0 1 0 11h-4.672l2.586 2.586L20 29l-5-5 5-5 1.414 1.414L18.828 23H23.5a3.5 3.5 0 0 0 0-7H4z"
      ></path>
      <path d="M4 22h7v2H4z"></path>
    </svg>
  </slot>
</ToolbarButton>
