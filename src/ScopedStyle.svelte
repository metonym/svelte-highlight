<script>
  // @ts-check
  /** @type {import('./scoped-style.d.ts').ScopedModuleName} */
  export let moduleName;

  /** @type {`<style>${string}</style>`} */
  export let content;
</script>

<svelte:head>
  {@html content}
</svelte:head>

<div style:display="contents" class={moduleName}>
  <slot />
</div>
