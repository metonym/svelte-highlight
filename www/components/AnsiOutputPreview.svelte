<script>
  import { Column, Row, Toggle } from "carbon-components-svelte";
  import { AnsiOutput, CodeWindow, parseAnsi } from "svelte-highlight";

  // `\x1b` helper; keeps raw escapes out of markup.
  const ESC = "\x1b";
  /** @param {...(number)} codes */
  const sgr = (...codes) => `${ESC}[${codes.join(";")}m`;
  const R = sgr(0);

  const NAMES = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
  ];

  // Standard and bright foreground swatches.
  const standardFg = NAMES.map((n, i) => `${sgr(30 + i)}${n}${R}`).join("  ");
  const brightFg = NAMES.map((n, i) => `${sgr(90 + i)}${n}${R}`).join("  ");
  const backgrounds = NAMES.map((n, i) => `${sgr(40 + i, 37)} ${n} ${R}`).join(
    " ",
  );

  // White-on-white background: tests auto-contrast.
  const lowContrast = backgrounds;

  const attributes = [
    `${sgr(1)}bold${R}`,
    `${sgr(2)}dim${R}`,
    `${sgr(3)}italic${R}`,
    `${sgr(4)}underline${R}`,
    `${sgr(1, 4, 31)}bold underline red${R}`,
    `${sgr(2, 3, 36)}dim italic cyan${R}`,
  ].join("   ");

  // 256-color cube, 36 swatches per row.
  let cube = "";
  for (let i = 16; i < 232; i += 1) {
    cube += `${sgr(48, 5, i)}  ${R}`;
    if ((i - 15) % 36 === 0) cube += "\n";
  }

  // Grayscale ramp (232–255).
  let grayscale = "";
  for (let i = 232; i < 256; i += 1) grayscale += `${sgr(48, 5, i)}  ${R}`;

  /**
   * @param {number} h hue in [0, 360)
   * @returns {[number, number, number]}
   */
  function hueToRgb(h) {
    const c = 1;
    const x = 1 - Math.abs(((h / 60) % 2) - 1);
    const [r, g, b] =
      h < 60
        ? [c, x, 0]
        : h < 120
          ? [x, c, 0]
          : h < 180
            ? [0, c, x]
            : h < 240
              ? [0, x, c]
              : h < 300
                ? [x, 0, c]
                : [c, 0, x];
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // Truecolor rainbow via `38;2;r;g;b`.
  let rainbow = "";
  for (let i = 0; i <= 72; i += 1) {
    const [r, g, b] = hueToRgb((i / 72) * 360);
    rainbow += `${sgr(38, 2, r, g, b)}█${R}`;
  }

  const buildLog = [
    `${sgr(1, 32)}$${R} npm run build`,
    "",
    `${sgr(36)}vite v7.3.3${R} ${sgr(2)}building for production...${R}`,
    `${sgr(32)}✓${R} 42 modules transformed.`,
    `dist/index.html              ${sgr(2)}0.46 kB${R} ${sgr(33)}│ gzip:  0.30 kB${R}`,
    `dist/assets/index-a1b2c3.js  ${sgr(2)}143.21 kB${R} ${sgr(33)}│ gzip: 46.12 kB${R}`,
    `${sgr(1, 32)}✓ built in 2.58s${R}`,
  ].join("\n");

  const testLog = [
    `${sgr(1)}RUN${R}  ${sgr(2)}v2.1.0 /svelte-highlight${R}`,
    "",
    ` ${sgr(42, 30)} PASS ${R} tests/ansi.test.ts ${sgr(2)}(17 tests)${R}`,
    ` ${sgr(41, 37)} FAIL ${R} tests/parser.test.ts ${sgr(2)}(1 failed)${R}`,
    `   ${sgr(31)}×${R} malformed input is dropped, not thrown`,
    "",
    ` ${sgr(1)}Test Files${R}  ${sgr(32)}1 passed${R} ${sgr(31)}1 failed${R} ${sgr(2)}(2)${R}`,
    ` ${sgr(1)}     Tests${R}  ${sgr(32)}16 passed${R} ${sgr(31)}1 failed${R} ${sgr(2)}(17)${R}`,
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

  // Unsupported and unterminated escapes (dropped, not thrown).
  const malformed = `${sgr(32)}safe${R} ${ESC}[999munknown code ignored${R} ${ESC}[1mthen unterminated${ESC}[`;

  const apiSample = `${sgr(1, 31)}error${R}: ${sgr(33)}deprecated${R}`;

  const simpleExamples = [
    {
      title: "Standard foreground colors",
      description: "SGR codes 30–37.",
      text: standardFg,
    },
    {
      title: "Bright foreground colors",
      description: "SGR codes 90–97.",
      text: brightFg,
    },
    {
      title: "Background colors",
      description:
        "SGR codes 40–47 with white text. Auto-contrast flips to black where white would vanish (the white swatch).",
      text: backgrounds,
    },
    {
      title: "Text attributes",
      description: "Bold, dim, italic, underline, alone or combined.",
      text: attributes,
    },
    {
      title: "256-color cube",
      description: "Indices 16–231 (38;5;n / 48;5;n).",
      text: cube,
    },
    {
      title: "256-color grayscale ramp",
      description: "Indices 232–255.",
      text: grayscale,
    },
    {
      title: "24-bit truecolor",
      description: "A rainbow built from 38;2;r;g;b sequences.",
      text: rainbow,
    },
    {
      title: "Build log",
      description: "Typical bundler output.",
      text: buildLog,
    },
    {
      title: "Test runner",
      description: "Pass / fail summary with colored badges.",
      text: testLog,
    },
    {
      title: "Git diff",
      description: "Added / removed lines.",
      text: gitDiff,
    },
    {
      title: "Malformed input",
      description:
        "Unsupported (999) and unterminated escape sequences are dropped, not thrown.",
      text: malformed,
    },
  ];

  // Raw escape codes under each example.
  let showRaw = false;

  /** @param {string} text */
  const raw = (text) => text.replaceAll(ESC, "␛");

  $: parsed = parseAnsi(apiSample);
</script>

<Row class="mb-5">
  <Column>
    <p class="mb-3">
      <code class="code">AnsiOutput</code>
      renders terminal output with ANSI SGR escape codes as styled HTML. The
      parser is separate from highlight.js. Build logs, CLI output, and test
      runners are the usual cases.
    </p>
    <Toggle
      labelText="Show raw escape codes"
      labelA="Hidden"
      labelB="Shown"
      bind:toggled={showRaw}
    />
  </Column>
</Row>

{#each simpleExamples as { title, description, text }}
  <Row class="mb-5">
    <Column xlg={12}>
      <h3 class="mb-3">{title}</h3>
      <p class="label-01 mb-3">{description}</p>
      <AnsiOutput {text} />
      {#if showRaw}
        <pre class="raw">{raw(text)}</pre>
      {/if}
    </Column>
  </Row>
{/each}

<Row class="mb-5">
  <Column xlg={12}>
    <h3 class="mb-3">Auto-contrast</h3>
    <p class="label-01 mb-3">
      <code class="code">autoContrast</code>
      (default on) flips a span's foreground to black or white when it wouldn't
      read on its background. Set
      <code class="code">autoContrast={false}</code>
      to keep the ANSI colors as-is.
    </p>
  </Column>
  <Column xlg={8} lg={8} md={12} class="mb-3">
    <p class="label-01 mb-3">autoContrast (default)</p>
    <AnsiOutput text={lowContrast} />
  </Column>
  <Column xlg={8} lg={8} md={12} class="mb-3">
    <p class="label-01 mb-3">autoContrast=&#123;false&#125;</p>
    <AnsiOutput text={lowContrast} autoContrast={false} />
  </Column>
</Row>

<Row class="mb-5">
  <Column xlg={12}>
    <h3 class="mb-3">Paired with <code class="code">CodeWindow</code></h3>
    <p class="label-01 mb-3">
      Wrap with <code class="code">CodeWindow variant="terminal"</code> for the
      prompt and title bar.
    </p>
    <CodeWindow variant="terminal" title="vitest">
      <AnsiOutput text={testLog} />
    </CodeWindow>
  </Column>
</Row>

<Row class="mb-5">
  <Column xlg={12}>
    <h3 class="mb-3">Themed palette</h3>
    <p class="label-01 mb-3">
      The 16 base colors, background, foreground, and bold/dim styling are CSS
      variables. Same build log, recolored toward Solarized.
    </p>
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
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}>
    <h3 class="mb-3">Parser API</h3>
    <p class="label-01 mb-3">
      <code class="code">parseAnsi(text)</code>
      returns the segments behind the component.
    </p>
    <AnsiOutput text={apiSample} />
    <pre class="raw">parseAnsi({JSON.stringify(raw(apiSample))})
// {JSON.stringify(parsed)}</pre>
  </Column>
</Row>

<style>
  .raw {
    margin-top: 0.5rem;
    padding: 0.75rem 1rem;
    background: #161616;
    color: #c6c6c6;
    border-radius: 4px;
    font-size: 0.8125rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
