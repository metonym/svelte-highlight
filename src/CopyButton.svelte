<script>
  /** @type {string} */
  export let code = "";

  /** @type {((text: string) => Promise<boolean> | boolean) | undefined} */
  export let copyFn = undefined;

  /** @type {string} */
  export let copyText = "Copy";

  /** @type {string} */
  export let copiedText = "Copied!";

  /** @type {number} */
  export let copyTimeout = 2_000;

  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();

  /** @type {boolean} */
  let isCopied = false;

  /** @type {number | undefined} */
  let copyTimeoutId = undefined;

  async function handleCopy() {
    if (isCopied) return;

    let success = false;

    try {
      if (copyFn) {
        const result = copyFn(code);
        success = result instanceof Promise ? await result : result;
      } else {
        await navigator.clipboard.writeText(code);
        success = true;
      }
    } catch (error) {
      console.error("Failed to copy text:", error);
      success = false;
    }

    if (success) {
      isCopied = true;
      dispatch("copy", { success: true, text: code });
      copyTimeoutId = window.setTimeout(() => {
        isCopied = false;
      }, copyTimeout);
    } else {
      dispatch("copy", { success: false, text: code });
    }
  }

  onMount(() => {
    return () => {
      if (copyTimeoutId) {
        clearTimeout(copyTimeoutId);
      }
    };
  });
</script>

<button
  type="button"
  class:copied={isCopied}
  disabled={isCopied}
  on:click={handleCopy}
  {...$$restProps}
>
  <slot {isCopied}>{isCopied ? copiedText : copyText}</slot>
</button>

<style>
  button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    background-color: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    z-index: 10;
    min-width: 4rem;
    text-align: center;
  }

  button:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
  }

  button:active:not(:disabled) {
    background-color: #e5e7eb;
    transform: translateY(1px);
  }

  button.copied {
    background-color: #10b981;
    border-color: #059669;
    color: white;
    cursor: default;
  }

  button:disabled {
    cursor: default;
  }

  button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>
