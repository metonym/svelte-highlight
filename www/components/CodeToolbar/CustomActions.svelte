<script>
  import { THEME_MODULE_NAME, THEME_NAME } from "@www/constants";
  import Highlight, {
    CodeToolbar,
    CopyButton,
    HighlightSvelte,
    LineNumbers,
    ToolbarButton,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import { sample as code } from "./sample.js";

  const snippet = `<script>
  import Highlight, {
    CodeToolbar,
    CopyButton,
    LineNumbers,
    ToolbarButton,
  } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import ${THEME_MODULE_NAME} from "svelte-highlight/styles/${THEME_NAME}";

  export let code;

  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    Object.assign(document.createElement("a"), {
      href: url,
      download: "config.ts",
    }).click();
    URL.revokeObjectURL(url);
  }
<\/script>

<svelte:head>
  {@html ${THEME_MODULE_NAME}}
</svelte:head>

<div class="code-block">
  <Highlight language={typescript} {code} let:highlighted let:languageName>
    <CodeToolbar {languageName} title="config.ts">
      <span slot="start" class="status">Edited</span>
      <ToolbarButton label="Download config.ts" on:click={download}>
        <svg viewBox="0 0 32 32" width="16" height="16" aria-hidden="true">
          <!-- download icon -->
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="View source on GitHub"
        href="https://github.com/you/repo/blob/main/config.ts"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 32 32" width="16" height="16" aria-hidden="true">
          <!-- external link icon -->
        </svg>
      </ToolbarButton>
      <CopyButton {code} />
    </CodeToolbar>
    <LineNumbers {highlighted} style="max-height: 24rem" />
  </Highlight>
</div>`;

  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    Object.assign(document.createElement("a"), {
      href: url,
      download: "config.ts",
    }).click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<div class="code-block {THEME_MODULE_NAME}">
  <Highlight language={typescript} {code} let:highlighted let:languageName>
    <CodeToolbar {languageName} title="config.ts">
      <span slot="start" class="status">Edited</span>
      <ToolbarButton label="Download config.ts" on:click={download}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10 10-10z"
          ></path>
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="View source on GitHub"
        href="https://github.com/metonym/svelte-highlight"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M26 28H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10v2H6v20h20V16h2v10a2 2 0 0 1-2 2z"
          ></path>
          <path d="M20 2v2h6.59L18 12.59 19.41 14 28 5.41V12h2V2H20z"></path>
        </svg>
      </ToolbarButton>
      <CopyButton {code} />
    </CodeToolbar>
    <LineNumbers {highlighted} style="max-height: 24rem" />
  </Highlight>
</div>

<style>
  .code-block {
    border-radius: 8px;
    overflow: clip;
  }

  .status {
    font-size: 0.875em;
    opacity: 0.6;
  }
</style>
