<script lang="ts">
  import { Highlight, CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = `interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(name, email) {
  return {
    id: Date.now(),
    name,
    email
  };
}

const user = createUser("John Doe", "john@example.com");`;
</script>

<div class="highlight-wrapper">
  <Highlight language={typescript} {code} class="github">
    <CopyButton {code}>
      <svelte:fragment let:isCopied>
        {#if isCopied}
          <span class="copied-icon">✓</span> Copied!
        {:else}
          <span class="copy-icon">📋</span> Copy Code
        {/if}
      </svelte:fragment>
    </CopyButton>
  </Highlight>
</div>

<style>
  .highlight-wrapper {
    position: relative;
  }

  :global(.github) {
    margin: 0;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .copy-icon,
  .copied-icon {
    margin-right: 0.5rem;
  }
</style>
