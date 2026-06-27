<script>
  /** @type {"macos" | "terminal" | "plain"} */
  export let variant = "macos";

  /** @type {string} */
  export let title = "";
</script>

<div class="code-window {variant}" {...$$restProps}>
  <div class="titlebar">
    {#if variant === "macos"}
      <span class="dots" aria-hidden="true">
        <span class="dot close"></span>
        <span class="dot minimize"></span>
        <span class="dot maximize"></span>
      </span>
    {:else if variant === "terminal"}
      <span class="prompt" aria-hidden="true">&gt;_</span>
    {/if}

    {#if title}
      <span class="title">{title}</span>
    {/if}
  </div>

  <div class="content">
    <slot />
  </div>
</div>

<style>
  .code-window {
    overflow: hidden;
    background: var(--window-background, #1e1e1e);
    border: var(--window-border, 1px solid rgba(255, 255, 255, 0.1));
    border-radius: var(--window-radius, 0);
  }

  .titlebar {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--titlebar-gap, 0.5em);
    padding: var(--titlebar-padding, 0.65em 1em);
    background: var(--titlebar-background, #2d2d2d);
    border-bottom: var(--titlebar-border, 1px solid rgba(255, 255, 255, 0.1));
    color: var(--titlebar-color, rgba(255, 255, 255, 0.6));
    font-family: var(
      --titlebar-font-family,
      system-ui,
      -apple-system,
      sans-serif
    );
    font-size: var(--titlebar-font-size, 0.8125em);
  }

  .dots {
    display: flex;
    align-items: center;
    gap: var(--dot-gap, 0.5em);
  }

  .dot {
    width: var(--dot-size, 0.75em);
    height: var(--dot-size, 0.75em);
    border-radius: 50%;
  }

  .dot.close {
    background: var(--dot-close, #ff5f56);
  }

  .dot.minimize {
    background: var(--dot-minimize, #ffbd2e);
  }

  .dot.maximize {
    background: var(--dot-maximize, #27c93f);
  }

  .prompt {
    font-family: var(--prompt-font-family, ui-monospace, monospace);
    font-weight: var(--prompt-font-weight, 700);
    color: var(--prompt-color, inherit);
  }

  .title {
    /* Center title across titlebar, ignoring dots/prompt. */
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    max-width: 70%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  .plain .title {
    /* Plain variant: no chrome, left-align title. */
    position: static;
    left: auto;
    transform: none;
    max-width: 100%;
  }

  .content {
    overflow: auto;
  }
</style>
