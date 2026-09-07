<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import Highlight, { HighlightSvelte } from "svelte-highlight";
  import { fromHighlightJs } from "svelte-highlight/compat";

  const EXPORT_RE = /^[ \t]*export(?=[ \t])/;
  const ATTR_RE = /[A-Za-z_][A-Za-z0-9_]*(?=[ \t]*=)/;
  const DOUBLE_QUOTE_RE = /"/;
  const SINGLE_QUOTE_RE = /'/;

  function defineDotenv(hljs) {
    return {
      name: "dotenv",
      contains: [
        hljs.HASH_COMMENT_MODE,
        { className: "keyword", begin: EXPORT_RE },
        { className: "attr", begin: ATTR_RE },
        {
          className: "string",
          variants: [
            {
              begin: DOUBLE_QUOTE_RE,
              end: DOUBLE_QUOTE_RE,
              contains: [hljs.BACKSLASH_ESCAPE],
            },
            { begin: SINGLE_QUOTE_RE, end: SINGLE_QUOTE_RE },
          ],
        },
      ],
    };
  }

  const code = "export PORT=3000\nAPI_KEY='sk-demo'\n# comment";

  const languagePromise = fromHighlightJs("dotenv-demo", defineDotenv);

  const snippet = `<script>
  import { Highlight } from "svelte-highlight";
  import { fromHighlightJs } from "svelte-highlight/compat";

  function defineDotenv(hljs) {
    return {
      name: "dotenv",
      contains: [
        hljs.HASH_COMMENT_MODE,
        { className: "keyword", begin: /^[ \\t]*export(?=[ \\t])/ },
        { className: "attr", begin: /[A-Za-z_][A-Za-z0-9_]*(?=[ \\t]*=)/ },
      ],
    };
  }

  const languagePromise = fromHighlightJs("dotenv-demo", defineDotenv);
<\/script>

{#await languagePromise then language}
  <Highlight {language} code={${JSON.stringify(code)}} />
{/await}`;
</script>

<HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />

{#await languagePromise then language}
  <Highlight {language} {code} class={THEME_MODULE_NAME} />
{/await}
