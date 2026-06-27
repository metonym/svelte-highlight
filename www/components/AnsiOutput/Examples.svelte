<script>
  import { THEME_MODULE_NAME } from "@www/constants";
  import { AnsiOutput, CodeWindow, HighlightSvelte } from "svelte-highlight";

  const ESC = "\x1b";
  /** @param {...(number)} codes */
  const sgr = (...codes) => `${ESC}[${codes.join(";")}m`;
  const R = sgr(0);

  // Joined lines keep formatter indentation (multiline templates don't).
  const snippet = [
    "<script>",
    '  import { AnsiOutput } from "svelte-highlight";',
    "",
    "  // Raw program output, escape codes included.",
    '  const text = "\\x1b[32m✓\\x1b[0m build succeeded";',
    "<\/script>",
    "",
    "<AnsiOutput {text} />",
  ].join("\n");

  const vitest = [
    `${sgr(1)}RUN${R}  ${sgr(2)}v2.1.0 /svelte-highlight${R}`,
    "",
    ` ${sgr(42, 30)} PASS ${R} tests/ansi.test.ts ${sgr(2)}(17 tests)${R}`,
    ` ${sgr(41, 37)} FAIL ${R} tests/parser.test.ts ${sgr(2)}(1 failed)${R}`,
    `   ${sgr(31)}×${R} malformed input is dropped, not thrown`,
    "",
    ` ${sgr(1)}Test Files${R}  ${sgr(32)}1 passed${R} ${sgr(31)}1 failed${R} ${sgr(2)}(2)${R}`,
    ` ${sgr(1)}     Tests${R}  ${sgr(32)}16 passed${R} ${sgr(31)}1 failed${R} ${sgr(2)}(17)${R}`,
    ` ${sgr(1)}  Duration${R}  ${sgr(2)}312ms${R}`,
  ].join("\n");

  const buildLog = [
    `${sgr(1, 32)}$${R} npm run build`,
    "",
    `${sgr(36)}vite v7.3.3${R} ${sgr(2)}building for production...${R}`,
    `${sgr(32)}✓${R} 42 modules transformed.`,
    `dist/index.html              ${sgr(2)}0.46 kB${R} ${sgr(33)}│ gzip:  0.30 kB${R}`,
    `dist/assets/index-a1b2c3.js  ${sgr(2)}143.21 kB${R} ${sgr(33)}│ gzip: 46.12 kB${R}`,
    `${sgr(1, 32)}✓ built in 2.58s${R}`,
  ].join("\n");

  const gitDiff = [
    `${sgr(1)}diff --git a/src/ansi.js b/src/ansi.js${R}`,
    `${sgr(36)}@@ -1,4 +1,9 @@${R}`,
    " export function parseAnsi(text) {",
    `${sgr(32)}+  if (!text) return [];${R}`,
    `${sgr(32)}+  const segments = [];${R}`,
    `${sgr(31)}-  // TODO: implement${R}`,
    "   return segments;",
    " }",
  ].join("\n");

  // Example markup beside each output (`text` = captured terminal output).
  const vitestMarkup = [
    '<CodeWindow variant="terminal" title="vitest">',
    "  <AnsiOutput {text} />",
    "</CodeWindow>",
  ].join("\n");

  const themedMarkup = [
    "<AnsiOutput",
    "  {text}",
    '  --ansi-background="#002b36"',
    '  --ansi-foreground="#93a1a1"',
    '  --ansi-green="#859900"',
    '  --ansi-yellow="#b58900"',
    '  --ansi-cyan="#2aa198"',
    '  --ansi-red="#dc322f"',
    '  --ansi-dim-opacity="0.65"',
    "/>",
  ].join("\n");

  const gitMarkup = "<AnsiOutput {text} />";

  const lightMarkup = [
    "<AnsiOutput",
    "  {text}",
    '  --ansi-background="#fdf6e3"',
    '  --ansi-foreground="#586e75"',
    '  --ansi-green="#859900"',
    '  --ansi-red="#dc322f"',
    '  --ansi-yellow="#b58900"',
    '  --ansi-blue="#268bd2"',
    '  --ansi-cyan="#2aa198"',
    '  --ansi-padding="1.25em"',
    '  --ansi-font-size="0.8125em"',
    '  --ansi-line-height="1.7"',
    '  --ansi-bold-weight="600"',
    '  --ansi-dim-opacity="0.7"',
    "/>",
  ].join("\n");

  /**
   * Escape captured output for a template literal (`\x1b`, backticks, `${`).
   */
  const forTemplate = (text) =>
    text
      .replaceAll("\\", "\\\\")
      .replaceAll("`", "\\`")
      .replaceAll("${", "\\${")
      .replaceAll(ESC, "\\x1b");

  /** Runnable snippet: imports, `text`, and markup. */
  const snippetFor = (imports, rawText, markup) =>
    [
      "<script>",
      `  import { ${imports} } from "svelte-highlight";`,
      "",
      `  const text = \`${forTemplate(rawText)}\`;`,
      "<\/script>",
      "",
      markup,
    ].join("\n");

  const vitestSnippet = snippetFor(
    "AnsiOutput, CodeWindow",
    vitest,
    vitestMarkup,
  );
  const themedSnippet = snippetFor("AnsiOutput", buildLog, themedMarkup);
  const gitSnippet = snippetFor("AnsiOutput", gitDiff, gitMarkup);
  const lightSnippet = snippetFor("AnsiOutput", vitest, lightMarkup);
</script>

<div class="mb-5">
  <HighlightSvelte code={snippet} class={THEME_MODULE_NAME} />
</div>

<p class="label-01 mb-3">Test runner, framed with a terminal window</p>
<div class="mb-3">
  <HighlightSvelte code={vitestSnippet} class={THEME_MODULE_NAME} />
</div>
<div class="mb-5">
  <CodeWindow variant="terminal" title="vitest">
    <AnsiOutput text={vitest} />
  </CodeWindow>
</div>

<p class="label-01 mb-3">
  Themed palette (Solarized-ish). Colors are
  <code class="code">--ansi-*</code>
  CSS variables.
</p>
<div class="mb-3">
  <HighlightSvelte code={themedSnippet} class={THEME_MODULE_NAME} />
</div>
<div class="mb-5">
  <AnsiOutput
    text={buildLog}
    --ansi-background="#002b36"
    --ansi-foreground="#93a1a1"
    --ansi-green="#859900"
    --ansi-yellow="#b58900"
    --ansi-cyan="#2aa198"
    --ansi-red="#dc322f"
    --ansi-dim-opacity="0.65"
  />
</div>

<p class="label-01 mb-3">Git diff</p>
<div class="mb-3">
  <HighlightSvelte code={gitSnippet} class={THEME_MODULE_NAME} />
</div>
<div class="mb-5">
  <AnsiOutput text={gitDiff} />
</div>

<p class="label-01 mb-3">
  Light theme. Custom background, palette, and type via
  <code class="code">--ansi-*</code>
  props.
</p>
<div class="mb-3">
  <HighlightSvelte code={lightSnippet} class={THEME_MODULE_NAME} />
</div>
<div class="mb-5">
  <AnsiOutput
    text={vitest}
    --ansi-background="#fdf6e3"
    --ansi-foreground="#586e75"
    --ansi-green="#859900"
    --ansi-red="#dc322f"
    --ansi-yellow="#b58900"
    --ansi-blue="#268bd2"
    --ansi-cyan="#2aa198"
    --ansi-padding="1.25em"
    --ansi-font-size="0.8125em"
    --ansi-line-height="1.7"
    --ansi-bold-weight="600"
    --ansi-dim-opacity="0.7"
  />
</div>
