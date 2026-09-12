<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { Button } from "carbon-components-svelte";
  import { HighlightStream, MarkdownStream } from "svelte-highlight";

  const VARIANTS = [
    `function add(a, b) {
  return a + b;
}`,
    `function add(a, b) {
  return Number(a) + Number(b);
}`,
    "const add = (a, b) => a + b;",
  ];

  function build(variant) {
    return [
      "Here's a helper that adds two numbers:",
      "",
      "```javascript",
      variant,
      "```",
      "",
      "Let me know if you'd like a different version!",
    ].join("\n");
  }

  let variantIndex = 0;
  let text = build(VARIANTS[variantIndex]);

  // Only the fenced code changes -- the surrounding prose (and its DOM
  // node) never gets re-created, since the splitter keeps the fence's id
  // stable across a `set` whenever its info string is unchanged.
  function regenerate() {
    variantIndex = (variantIndex + 1) % VARIANTS.length;
    text = build(VARIANTS[variantIndex]);
  }
</script>

<MarkdownStream {text} done>
  <svelte:fragment slot="fence" let:segment let:language>
    <HighlightStream
      code={segment.code}
      {language}
      done
      class={THEME_MODULE_NAME}
    />
  </svelte:fragment>
</MarkdownStream>

<Button
  size="small"
  kind="tertiary"
  style="margin-top: 0.75rem"
  on:click={regenerate}
>
  Regenerate
</Button>
