<script>
  /** @type {string} */
  export let code;

  /**
   * Override copy behavior. Defaults to `navigator.clipboard.writeText`.
   * @type {(code: string) => void | Promise<void>}
   */
  export let copy = (code) => navigator.clipboard.writeText(code);

  /**
   * Transform `code` before it is passed to `copy`. Defaults to identity.
   * The transformed string is what `on:copy` reports in `detail.code`.
   * @type {(code: string) => string}
   */
  export let transform = (code) => code;

  /** @type {number} */
  export let timeout = 2_000;

  /** @type {string} */
  export let text = "Copy";

  /** @type {string} */
  export let copiedText = "Copied!";

  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  /** @type {boolean} */
  let copied = false;

  /** @type {boolean} */
  let copying = false;

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timeoutId;

  async function handleClick() {
    // Ignore clicks while copying or showing "Copied".
    if (copying || copied) return;

    try {
      copying = true;
      const transformed = transform(code);
      await copy(transformed);
      copied = true;
      dispatch("copy", { code: transformed });
      timeoutId = setTimeout(() => {
        copied = false;
      }, timeout);
    } catch (error) {
      dispatch("error", { error });
    } finally {
      copying = false;
    }
  }

  onMount(() => () => clearTimeout(timeoutId));
</script>

<button
  type="button"
  aria-label={copied ? copiedText : text}
  on:click={handleClick}
  on:mouseenter
  on:mouseleave
  {...$$restProps}
>
  <slot {copied} {copying}>
    {#if copied}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="16"
        height="16"
        fill="currentColor"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          d="M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"
        ></path>
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="16"
        height="16"
        fill="currentColor"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          d="M28,10V28H10V10H28m0-2H10a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2Z"
        ></path>
        <path d="M4,18H2V4A2,2,0,0,1,4,2H18V4H4Z"></path>
      </svg>
    {/if}
  </slot>
</button>

<style>
  button {
    position: absolute;
    top: var(--copy-top, 0.5em);
    right: var(--copy-right, 0.5em);
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--copy-size, 2em);
    height: var(--copy-size, 2em);
    padding: var(--copy-padding, 0.5em);
    background: var(--copy-background, inherit);
    color: var(--copy-color, inherit);
    border-radius: var(--copy-border-radius, 4px);
    border: var(--copy-border, none);
    z-index: var(--copy-z-index, 2);
    cursor: pointer;
  }
</style>
