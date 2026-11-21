<script>
  import Highlight, {
    AnsiOutput,
    CodeWindow,
    CopyButton,
    createDiffController,
    DiffFileList,
    DiffMinimap,
    DiffStats,
    DiffView,
    FileTabs,
    HighlightAuto,
    HighlightDiff,
    HighlightEditable,
    HighlightStream,
    HighlightSvelte,
    HighlightVirtual,
    LineNumbers,
    MarkdownStream,
    Typewriter,
  } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  /**
   * Which component to render.
   * @type {"highlight" | "line-numbers" | "virtual" | "ansi" | "code-window" | "copy-button" | "editable" | "typewriter" | "stream" | "stream-virtual" | "markdown-stream" | "diff" | "diff-split" | "diff-review" | "diff-streaming" | "diff-parts" | "diff-file-list" | "file-tabs"}
   */
  export let component = "highlight";

  /** Pass through to streaming components. */
  export let done = false;

  // Long lines so every code block overflows the narrow wrapper.
  const long = `const values = [${Array.from({ length: 60 }, (_, i) => i).join(", ")}];`;
  const code = `${long}\nconst add = (a: number, b: number) => a + b;\n`;
  const ansi = `\u001b[32m✓\u001b[0m passed ${"·".repeat(200)}\n\u001b[31m✗\u001b[0m failed`;

  function lines(n) {
    let out = "";
    for (let i = 0; i < n; i++) out += `const x${i} = ${i}; // line ${i}\n`;
    return out;
  }
  const before = lines(40);
  const after = before
    .replace("const x5 = 5;", `${long} // changed`)
    .replace("const x30 = 30;", "const changed = true;");

  const diff = createDiffController({ language: javascript });
  diff.update(before, after);

  const files = [0, 1].map((f) => ({
    path: `src/file-${f}.js`,
    before,
    after: after.replace("x1 =", `f${f} =`),
    language: javascript,
  }));

  const tabFiles = ["App.svelte", "index.js"];
  let active = tabFiles[0];

  const markdown = `Intro text.\n\n\`\`\`js\n${long}\n\`\`\`\n\nOutro text.\n`;
</script>

<svelte:head>{@html atomOneDark}</svelte:head>

<main style="width: 360px; position: relative">
  {#if component === "highlight"}
    <Highlight language={typescript} {code} />
    <HighlightAuto {code} />
    <HighlightSvelte code={`<script>${long}</script>`} />
    <Highlight language={typescript} {code} langtag label="Add function" />
  {:else if component === "line-numbers"}
    <Highlight language={typescript} {code} let:highlighted>
      <LineNumbers {highlighted} />
    </Highlight>
  {:else if component === "virtual"}
    <HighlightVirtual
      language={javascript}
      code={after}
      style="height: 200px"
    />
  {:else if component === "ansi"}
    <CodeWindow variant="terminal" title="bash">
      <AnsiOutput text={ansi} />
    </CodeWindow>
    <AnsiOutput text={ansi} />
  {:else if component === "code-window"}
    <CodeWindow variant="macos" title="example.ts">
      <Highlight language={typescript} {code} />
    </CodeWindow>
    <CodeWindow variant="terminal">
      <Highlight language={typescript} {code} />
    </CodeWindow>
    <CodeWindow variant="plain" label="Plain example">
      <Highlight language={typescript} {code} />
    </CodeWindow>
  {:else if component === "copy-button"}
    <div style="position: relative">
      <Highlight language={typescript} {code} />
      <CopyButton {code} copy={() => {}} timeout={60_000} />
    </div>
    <div style="position: relative">
      <Highlight language={typescript} {code} label="Broken copy" />
      <CopyButton
        {code}
        text="Copy, fails"
        copy={() => {
          throw new Error("denied");
        }}
        timeout={60_000}
      />
    </div>
  {:else if component === "editable"}
    <HighlightEditable
      language={typescript}
      {code}
      label="Editable TypeScript example"
    />
    <HighlightEditable language={javascript} code={long} readonly />
  {:else if component === "typewriter"}
    <Highlight language={typescript} {code} let:highlighted>
      <Typewriter {highlighted} speed={1} />
    </Highlight>
  {:else if component === "stream"}
    <HighlightStream language={typescript} {code} {done} />
  {:else if component === "stream-virtual"}
    <HighlightStream
      language={javascript}
      code={after}
      {done}
      virtualize
      style="height: 200px"
    />
  {:else if component === "markdown-stream"}
    <MarkdownStream text={markdown} {done} />
  {:else if component === "diff"}
    <HighlightDiff {before} {after} language={javascript} />
  {:else if component === "diff-split"}
    <HighlightDiff {before} {after} language={javascript} view="split" />
  {:else if component === "diff-review"}
    <HighlightDiff {before} {after} language={javascript} review />
  {:else if component === "diff-streaming"}
    <HighlightDiff
      {before}
      after={after.slice(0, after.length / 2)}
      language={javascript}
      streaming
    />
  {:else if component === "diff-parts"}
    <DiffStats {diff} />
    <div style="display: flex">
      <DiffView {diff} style="height: 240px; flex: 1" />
      <DiffMinimap {diff} style="height: 240px" />
    </div>
  {:else if component === "diff-file-list"}
    <DiffFileList {files} style="height: 400px" />
  {:else if component === "file-tabs"}
    <FileTabs files={tabFiles} bind:active let:active>
      <Highlight
        language={active === "index.js" ? javascript : typescript}
        {code}
      />
    </FileTabs>
  {/if}
</main>
