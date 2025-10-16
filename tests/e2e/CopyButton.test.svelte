<script lang="ts">
  import { Highlight, CopyButton } from "../../src/index.js";
  import javascript from "highlight.js/lib/languages/javascript";

  let copyCount = 0;
  let lastCopiedText = "";

  function handleCopy(event: CustomEvent<{ success: boolean; text: string }>) {
    copyCount++;
    lastCopiedText = event.detail.text;
    console.log("Copy event:", event.detail);
  }

  const jsCode = `function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Hello, \${name}!\`;
}

greet('World');`;
</script>

<div class="copy-button-test">
  <h3>CopyButton Test</h3>

  <div class="test-section">
    <h4>Basic CopyButton (Default Content)</h4>
    <Highlight
      language={{ name: "javascript", register: javascript }}
      code={jsCode}
    >
      <CopyButton code={jsCode} on:copy={handleCopy} />
    </Highlight>
  </div>

  <div class="test-section">
    <h4>CopyButton with Custom Text Props</h4>
    <Highlight
      language={{ name: "javascript", register: javascript }}
      code={jsCode}
    >
      <CopyButton
        code={jsCode}
        copyText="Copy JS"
        copiedText="Copied JS!"
        on:copy={handleCopy}
      />
    </Highlight>
  </div>

  <div class="test-section">
    <h4>CopyButton with Custom Slot Content</h4>
    <Highlight
      language={{ name: "javascript", register: javascript }}
      code={jsCode}
    >
      <CopyButton code={jsCode} on:copy={handleCopy}>
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

  <div class="test-section">
    <h4>CopyButton with Custom Copy Function</h4>
    <Highlight
      language={{ name: "javascript", register: javascript }}
      code={jsCode}
    >
      <CopyButton
        code={jsCode}
        copyFn={(text) => {
          console.log("Custom copy function called with:", text);
          return Promise.resolve(true);
        }}
        copyText="Custom Copy"
        copiedText="Custom Done!"
        on:copy={handleCopy}
      />
    </Highlight>
  </div>

  <div class="test-section">
    <h4>CopyButton with Custom Styling</h4>
    <Highlight
      language={{ name: "javascript", register: javascript }}
      code={jsCode}
    >
      <CopyButton
        code={jsCode}
        copyText="Styled Copy"
        style="top: 1rem; right: 1rem; background: #ef4444; color: white; border-color: #dc2626;"
        on:copy={handleCopy}
      />
    </Highlight>
  </div>

  <div class="test-section">
    <h4>CopyButton with Advanced Slot Content</h4>
    <Highlight
      language={{ name: "javascript", register: javascript }}
      code={jsCode}
    >
      <CopyButton code={jsCode} on:copy={handleCopy}>
        <svelte:fragment let:isCopied>
          <div class="custom-button-content">
            {#if isCopied}
              <span class="success">✓ Successfully copied!</span>
            {:else}
              <span class="action">📋 Click to copy JavaScript code</span>
            {/if}
          </div>
        </svelte:fragment>
      </CopyButton>
    </Highlight>
  </div>

  <div class="test-info">
    <p>Copy events: {copyCount}</p>
    <p>Last copied: {lastCopiedText || "None"}</p>
  </div>
</div>

<style>
  .copy-button-test {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .test-section {
    margin-bottom: 2rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .test-section h4 {
    margin: 0;
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
    font-size: 1rem;
    font-weight: 600;
  }

  .test-info {
    margin-top: 2rem;
    padding: 1rem;
    background: #f0f9ff;
    border: 1px solid #0ea5e9;
    border-radius: 0.5rem;
  }

  .test-info p {
    margin: 0.5rem 0;
    font-family: monospace;
  }

  .copy-icon,
  .copied-icon {
    margin-right: 0.5rem;
  }

  .custom-button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 8rem;
  }

  .success {
    color: #10b981;
    font-weight: 600;
  }

  .action {
    color: #6b7280;
  }
</style>
