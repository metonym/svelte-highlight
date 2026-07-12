<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Column, Row } from "carbon-components-svelte";
  import { HighlightVirtual } from "svelte-highlight";
  import css from "svelte-highlight/languages/css";
  import markdown from "svelte-highlight/languages/markdown";
  import { generateCss, generateMarkdown } from "./generate-large-code.js";

  const languages = [
    {
      name: "Markdown",
      language: markdown,
      code: generateMarkdown(3_000),
    },
    {
      name: "CSS",
      language: css,
      code: generateCss(8_000),
    },
  ];
</script>

<Row>
  {#each languages as { name, language, code }}
    <Column xlg={8} lg={8} md={12} class="mb-5">
      <div class="label-01 mb-3">
        {name}
        -- {code.split("\n").length.toLocaleString()} lines
      </div>
      <HighlightVirtual
        {language}
        {code}
        class={THEME_MODULE_NAME}
        style="height: 260px"
      />
    </Column>
  {/each}
</Row>
