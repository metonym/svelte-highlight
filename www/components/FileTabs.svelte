<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import Highlight, { FileTabs, HighlightSvelte } from "svelte-highlight";
  import css from "svelte-highlight/languages/css";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";

  const sources = {
    "App.svelte": { language: typescript, code: "const answer = 42;" },
    "index.js": { language: javascript, code: "export default answer;" },
    "styles.css": { language: css, code: ".hljs {\n  color: inherit;\n}" },
  };

  const files = Object.keys(sources);

  const snippet = `<script>
    import Highlight, { FileTabs } from "svelte-highlight";
    import javascript from "svelte-highlight/languages/javascript";
    import typescript from "svelte-highlight/languages/typescript";
    import github from "svelte-highlight/styles/github";

    const sources = {
      "App.svelte": { language: typescript, code: "const answer = 42;" },
      "index.js": { language: javascript, code: "export default answer;" },
    };

    const files = Object.keys(sources);
  <\/script>

  <svelte:head>
    {@html github}
  </svelte:head>

  <FileTabs {files} let:active>
    <Highlight language={sources[active].language} code={sources[active].code} />
  </FileTabs>`;
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<p class="mb-5">Pick a tab, or use the arrow keys:</p>

<FileTabs {files} let:active>
  <Highlight
    language={sources[active].language}
    code={sources[active].code}
    class={THEME_MODULE_NAME}
  />
</FileTabs>
