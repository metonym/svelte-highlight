<script>
  import AnsiOutputExamples from "@components/AnsiOutput/Examples.svelte";
  import CodeSnippet from "@components/CodeSnippet.svelte";
  import CodeWindowPreview from "@components/CodeWindowPreview.svelte";
  import CopyButtonBasic from "@components/CopyButton/Basic.svelte";
  import CopyButtonCustomFunction from "@components/CopyButton/CustomFunction.svelte";
  import CopyButtonLangtag from "@components/CopyButton/Langtag.svelte";
  import CopyButtonLineNumbers from "@components/CopyButton/LineNumbers.svelte";
  import CopyButtonSlot from "@components/CopyButton/Slot.svelte";
  import CopyButtonStyleProps from "@components/CopyButton/StyleProps.svelte";
  import FileTabs from "@components/FileTabs.svelte";
  import EditableBasic from "@components/HighlightEditable/Basic.svelte";
  import EditableCommands from "@components/HighlightEditable/Commands.svelte";
  import HighlightStreamBasic from "@components/HighlightStream/Basic.svelte";
  import HighlightStreamControls from "@components/HighlightStream/Controls.svelte";
  import Basic from "@components/LineNumbers/Basic.svelte";
  import ContainerStyle from "@components/LineNumbers/ContainerStyle.svelte";
  import FocusLines from "@components/LineNumbers/FocusLines.svelte";
  import HideBorder from "@components/LineNumbers/HideBorder.svelte";
  import HighlightedLines from "@components/LineNumbers/HighlightedLines.svelte";
  import HighlightedLinesCustomColor from "@components/LineNumbers/HighlightedLinesCustomColor.svelte";
  import Langtag from "@components/LineNumbers/Langtag.svelte";
  import StartingLineNumber from "@components/LineNumbers/StartingLineNumber.svelte";
  import StyleProps from "@components/LineNumbers/StyleProps.svelte";
  import WrapLines from "@components/LineNumbers/WrapLines.svelte";
  import ScopedStyle from "@components/ScopedStyle.svelte";
  import ScopedStyleAuto from "@components/ScopedStyleAuto.svelte";
  import ScopedStyleSvelte from "@components/ScopedStyleSvelte.svelte";
  import ScopedThemes from "@components/ScopedThemes.svelte";
  import ScopedThemesDark from "@components/ScopedThemesDark.svelte";
  import TypewriterBasic from "@components/Typewriter/Basic.svelte";
  import TypewriterControls from "@components/Typewriter/Controls.svelte";
  import { PKG_NAME, THEME_MODULE_NAME, THEME_NAME } from "@www/constants";
  import {
    Column,
    InlineNotification,
    Link,
    ListItem,
    Row,
    UnorderedList,
  } from "carbon-components-svelte";
  import Highlight, { HighlightSvelte } from "svelte-highlight";
  import css from "svelte-highlight/languages/css";

  const svelteHeadCdn = `<link
      rel="stylesheet"
      href="https://unpkg.com/svelte-highlight/styles/github.css"
    />\n`;
</script>

<Row>
  <Column xlg={16} lg={16}>
    <p class="text-02">
      Svelte component library for highlighting code using{" "}
      <Link
        inline
        style="font-size: inherit"
        href="https://github.com/highlightjs/highlight.js"
        >highlight.js.</Link
      >
    </p>
  </Column>
</Row>

<Row>
  <Column xlg={12}> <h4>Installation</h4> </Column>
  <Column xlg={6} lg={6} md={6}>
    <CodeSnippet code="npm i {PKG_NAME}" /><br>
    <CodeSnippet code="pnpm i {PKG_NAME}" /><br>
    <CodeSnippet code="bun add {PKG_NAME}" /><br>
    <CodeSnippet code="yarn add {PKG_NAME}" />
  </Column>
</Row>

<Row>
  <Column> <hr> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Usage</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">The default Highlight component requires two props:</p>
    <UnorderedList class="mb-5">
      <ListItem><code class="code">code</code>: text to highlight</ListItem>
      <ListItem>
        <code class="code">language</code>: language grammar used to highlight
        the text
      </ListItem>
    </UnorderedList>
    <p class="mb-5">
      Import languages from
      <code class="code">svelte-highlight/languages</code>.
    </p>
    <p class="mb-5">
      See the{" "}
      <Link size="lg" href="/languages">Languages page</Link> for a list of
      supported languages.
    </p>
  </Column>
  <Column xlg={10} lg={10}>
    <ScopedStyle name={THEME_NAME} moduleName={THEME_MODULE_NAME} />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Import styles from <code class="code">svelte-highlight/styles</code>.
    </p>
    <p class="mb-5">There are two ways to add styles:</p>
    <UnorderedList class="mb-5">
      <ListItem
        ><code class="code">Injected styles</code>: JavaScript styles injected
        using the svelte:head API</ListItem
      >
      <ListItem>
        <code class="code">CSS StyleSheet</code>: CSS file that may require an
        appropriate file loader
      </ListItem>
    </UnorderedList>
    <p class="mb-5">
      Refer to the{" "}
      <Link size="lg" href="/styles">Styles page</Link> for a list of supported
      styles.
    </p>
    <p>
      CSS StyleSheets can also be externally linked from a Content Delivery
      Network (CDN) like{" "}
      <Link size="lg" href="https://unpkg.com/">unpkg.com</Link>
      .
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte code={svelteHeadCdn} class={THEME_MODULE_NAME} />
    <InlineNotification
      lowContrast
      hideCloseButton
      kind="warning"
      title="Note:"
      subtitle="Using a CDN is best suited for prototyping and not recommended for production use."
    />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Scoping styles</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Themes target global <code class="code">.hljs</code> selectors, so the
      last one injected wins. That is fine when every block shares one theme.
    </p>
    <p class="mb-5">
      Use <code class="code">HighlightStyle</code> when blocks on the same page
      need different themes, like a style gallery or a light snippet next to a
      dark one.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <ScopedThemes />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Dark mode</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      <code class="code">HighlightStyle</code>
      can emit a light and a dark theme together and switch between them. Pass
      <code class="code">light</code>
      and
      <code class="code">dark</code>
      instead of <code class="code">theme</code>.
    </p>
    <p class="mb-5">
      The <code class="code">mode</code> prop controls how the two themes are
      switched (default <code class="code">"auto"</code>):
    </p>
    <UnorderedList class="mb-5">
      <ListItem>
        <code class="code">"auto"</code>: wrap each theme in a
        <code class="code">@media (prefers-color-scheme)</code>
        query so the OS or browser preference decides.
      </ListItem>
      <ListItem>
        <code class="code">"light"</code>
        / <code class="code">"dark"</code>: emit only that single theme.
      </ListItem>
      <ListItem>
        any other string: treated as a CSS selector that gates the dark block
        while light stays the default—e.g.
        <code class="code">[data-theme="dark"]</code>
        to drive theming from a manual toggle.
      </ListItem>
    </UnorderedList>
    <p class="mb-5">
      Both themes are scoped to the wrapper, so different blocks can use
      different theme pairs on the same page. When
      <code class="code">light</code>
      and <code class="code">dark</code> are both set they take precedence over
      <code class="code">theme</code>; passing only
      <code class="code">theme</code>
      keeps the existing single-theme behavior unchanged.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <ScopedThemesDark />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Svelte Syntax Highlighting</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use the <code class="code">HighlightSvelte</code> component for Svelte
      syntax highlighting.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <ScopedStyleSvelte name={THEME_NAME} moduleName={THEME_MODULE_NAME} />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Auto-highlighting</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      The <code class="code">HighlightAuto</code> component invokes the
      <code class="code">highlightAuto</code>
      API from <code class="code">highlight.js</code>.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <ScopedStyleAuto name={THEME_NAME} moduleName={THEME_MODULE_NAME} />
    <InlineNotification
      lowContrast
      hideCloseButton
      kind="warning"
      title="Note:"
      subtitle="Auto-highlighting will result in a larger bundle size. Specify a language if possible."
    />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Optionally, you can restrict language detection to a specific subset using
      the <code class="code">languageNames</code> prop. This can improve
      performance and accuracy.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte
      code={`<script>
  import { HighlightAuto } from "svelte-highlight";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const x = 42;";
<\/script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<HighlightAuto {code} languageNames={["javascript", "typescript"]} />`}
      class={THEME_MODULE_NAME}
    />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Action</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use the <code class="code">highlight</code> action to highlight existing
      <code class="code">{"<pre><code>"}</code>
      markup in place. This is useful for progressively enhancing
      server-rendered content like Markdown without swapping in a component.
    </p>
    <p class="mb-5">
      The action accepts the same <code class="code">language</code> prop as the
      components. When <code class="code">code</code> is omitted, the element's
      existing <code class="code">textContent</code> is highlighted. Updating
      <code class="code">code</code>
      re-highlights the element.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte
      code={`<script>
  import { highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a, b) => a + b;";
<\/script>

<svelte:head>
  {@html github}
<\/svelte:head>

<pre><code use:highlight={{ language: typescript, code }}><\/code><\/pre>`}
      class={THEME_MODULE_NAME}
    />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Line Numbers</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use the <code class="code">LineNumbers</code> component to render the
      highlighted code with line numbers.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <Basic /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Set <code class="code">hideBorder</code> to <code class="code">true</code>
      to hide the border of the line numbers column.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <HideBorder /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      By default, overflowing horizontal content is contained by a scrollbar.
    </p>
    <p class="mb-5">
      Set <code class="code">wrapLines</code> to <code class="code">true</code>
      to apply a <code class="code">white-space: pre-wrap</code> rule to the
      <code class="code">pre</code>
      element.
    </p>
  </Column>
  <Column xlg={8} lg={8} md={12}> <WrapLines /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">--style-props</code> to customize visual
      properties.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <StyleProps /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use container-level variables like
      <code class="code">--border-radius</code>,
      <code class="code">--width</code>, and
      <code class="code">--max-width</code>
      to style the outer container without
      <code class="code">:global</code>
      overrides.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <ContainerStyle /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">startingLineNumber</code> to customize the starting
      line number. By default, line numbers start at
      <code class="code">1</code>.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <StartingLineNumber /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">highlightedLines</code> to highlight specific
      lines. Indices start at zero.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <HighlightedLines /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">--unhighlighted-opacity</code> or
      <code class="code">--unhighlighted-filter</code>
      to de-emphasize the remaining lines and focus attention on the highlighted
      ones.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <FocusLines /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">--highlighted-background</code> to customize the
      background color of highlighted lines.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <HighlightedLinesCustomColor /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      When using a custom slot, forward <code class="code">langtag</code> and
      <code class="code">languageName</code>
      from
      <code class="code">Highlight</code>
      to
      <code class="code">LineNumbers</code>.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <Langtag /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Copy Button</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Compose the <code class="code">CopyButton</code> component alongside
      <code class="code">Highlight</code>
      to add a copy-to-clipboard button. Position it by wrapping both in a
      relatively-positioned container.
    </p>
    <p class="mb-5">
      By default, it copies the <code class="code">code</code> using the native
      Clipboard API and shows a transient "copied" state.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <CopyButtonBasic /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Pass a <code class="code">copy</code> function to override the default
      copy behavior—for example, to add logging or a custom toast.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <CopyButtonCustomFunction /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Provide custom button content using the default slot. The slot exposes a
      <code class="code">copied</code>
      boolean.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <CopyButtonSlot /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">--copy-*</code> style props to customize the
      offset, size, and colors of the button.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <CopyButtonStyleProps /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Compose <code class="code">CopyButton</code> with
      <code class="code">LineNumbers</code>
      by wrapping both in a relatively-positioned container.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <CopyButtonLineNumbers /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      When using a language tag alongside
      <code class="code">CopyButton</code>, offset
      <code class="code">--langtag-top</code>
      and
      <code class="code">--langtag-right</code>
      so the tag sits to the left of the button.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <CopyButtonLangtag /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Code Window</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Wrap a code block in the <code class="code">CodeWindow</code> component to
      frame it with window chrome. It is purely cosmetic—the default slot
      renders your content unchanged.
    </p>
    <p class="mb-5">
      Use the <code class="code">variant</code> prop to choose the chrome style:
      <code class="code">"macos"</code>
      (default) renders traffic-light dots,
      <code class="code">"terminal"</code>
      renders a prompt, and <code class="code">"plain"</code> renders just the
      title bar. The optional <code class="code">title</code> is shown in the
      title bar.
    </p>
    <p class="mb-5">
      The chrome is themable with <code class="code">--window-*</code>,
      <code class="code">--titlebar-*</code>, and
      <code class="code">--dot-*</code>
      style props.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <CodeWindowPreview /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Animation</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">Typewriter</code> inside
      <code class="code">Highlight</code>'s default slot with the
      <code class="code">highlighted</code>
      prop. It prints the code one character at a time, syntax highlighting
      included. A blinking caret marks the end of the typed text and hides when
      typing stops.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <TypewriterBasic /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Set <code class="code">speed</code> (milliseconds per character) and pause
      with <code class="code">play</code>. Turn
      <code class="code">play</code>
      back on to pick up where you left off. A new
      <code class="code">highlighted</code>
      value starts over from the first character. Fire
      <code class="code">on:done</code>
      when the last character is visible.
    </p>
    <p class="mb-5">
      Customize the caret with <code class="code">--caret-width</code>,
      <code class="code">--caret-height</code>,
      <code class="code">--caret-gap</code>,
      <code class="code">--caret-color</code>, and
      <code class="code">--caret-blink</code>. The demo below puts
      <code class="code">Typewriter</code>
      inside a
      <code class="code">CodeWindow</code>.
    </p>
    <InlineNotification
      lowContrast
      hideCloseButton
      kind="info"
      title="Reduced motion"
      subtitle="With prefers-reduced-motion, the full block shows immediately and on:done runs right away."
    />
  </Column>
  <Column xlg={10} lg={10} md={12}> <TypewriterControls /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Streaming</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Rendering LLM chat output is the dominant new syntax-highlighting use
      case: code arrives in arbitrary-sized chunks, mid-token and mid-line, and
      you don't know the full content up front.
      <code class="code">HighlightStream</code>
      is built for that—unlike <code class="code">Typewriter</code>, which
      animates a complete, already-highlighted string, it accepts a growing
      <code class="code">code</code>
      buffer and re-highlights it as chunks arrive.
    </p>
    <p class="mb-5">
      Append to <code class="code">code</code> as chunks come in; set
      <code class="code">done</code>
      once the stream ends. A blinking caret marks the end of output while
      <code class="code">!done</code>; finishing hides it and performs one final
      full highlight, so the output matches what
      <code class="code">Highlight</code>
      would render for the same code.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <HighlightStreamBasic /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Already-rendered lines are diffed and left untouched in the DOM—only lines
      whose content actually changed are repainted, so a fast-streaming response
      only touches its changed suffix. An open multi-line construct—an
      unterminated template literal or block comment—re-tokenizes the lines it
      spans once the closing delimiter arrives, with no special-casing needed.
    </p>
    <p class="mb-5">
      Set <code class="code">autoScroll</code> to keep the container pinned to
      the bottom as output grows. It stops as soon as you scroll up, and resumes
      once you scroll back down. Customize the caret with the same
      <code class="code">--caret-*</code>
      variables as <code class="code">Typewriter</code>.
    </p>
    <InlineNotification
      lowContrast
      hideCloseButton
      kind="info"
      title="Performance"
      subtitle="O(buffer) per highlighted frame, DOM updates proportional to changed lines—fine for chat-sized output up to a few thousand lines, not a virtualized log viewer."
    />
  </Column>
  <Column xlg={10} lg={10} md={12}> <HighlightStreamControls /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Terminal Output</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      <code class="code">AnsiOutput</code>
      renders terminal output with ANSI SGR escape codes as styled HTML. The
      parser is separate from highlight.js. Build logs, CLI output, and test
      runners are the usual cases.
    </p>
    <p class="mb-5">
      Standard, bright, 256-color, and 24-bit truecolor codes work, along with
      bold, dim, italic, and underline. Bad sequences are dropped.
    </p>
    <p class="mb-5">
      Theme the 16 base colors and bold/dim styling with
      <code class="code">--ansi-*</code>
      props. <code class="code">autoContrast</code> (default on) flips text to
      black or white when it wouldn't read on its background.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <AnsiOutputExamples /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Editable</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      <code class="code">HighlightEditable</code>
      is a
      <code class="code">contenteditable</code>
      code block. It re-highlights on every edit and keeps the caret where you
      left it.
    </p>
    <p class="mb-5">
      <code class="code">bind:code</code>
      keeps your state in sync. Try typing in the block below.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <EditableBasic /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      <code class="code">Enter</code>
      inserts a newline,
      <code class="code">Tab</code>/<code class="code">Shift+Tab</code>
      indent the selected lines, and <code class="code">Cmd/Ctrl+Z</code> /
      <code class="code">Shift+Z</code>
      undo and redo. Set <code class="code">tabSize</code> and
      <code class="code">historyLimit</code>
      to customize.
    </p>
    <p class="mb-5">
      <code class="code">bind:this</code>
      exposes
      <code class="code">undo()</code>, <code class="code">redo()</code>,
      <code class="code">indent()</code>, <code class="code">insert()</code>,
      <code class="code">setCode()</code>, and
      <code class="code">clear()</code>.
      <code class="code">on:history</code>
      reports
      <code class="code">canUndo</code>
      and <code class="code">canRedo</code>.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <EditableCommands /> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Customize the focus outline with
      <code class="code">--outline-color</code>,
      <code class="code">--outline-width</code>, and
      <code class="code">--outline-offset</code>.
    </p>
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>File Tabs</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      <code class="code">FileTabs</code>
      groups snippets behind a tab strip. Pass file names as
      <code class="code">files</code>
      and use
      <code class="code">let:active</code>
      in the default slot to render the matching
      <code class="code">Highlight</code>
      block.
    </p>
    <p class="mb-5">
      Arrow keys move between tabs; <code class="code">Home</code> and
      <code class="code">End</code>
      jump to the ends.
      <code class="code">bind:active</code>
      sets the open tab from your code.
      <code class="code">on:change</code>
      fires when the user picks a different one.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}> <FileTabs /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Language Targeting</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      All <code class="code">Highlight</code> components apply a
      <code class="code">data-language</code>
      attribute on the codeblock containing the language name.
    </p>
    <p class="mb-5">This is also compatible with custom languages.</p>
    <p class="mb-5">
      See the{" "}
      <Link size="lg" href="/languages">Languages page</Link> for a list of
      supported languages.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <Highlight
      code={'[data-language="css"] {\n  /* custom style rules */\n}'}
      language={css}
      class={THEME_MODULE_NAME}
    />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Language Tags</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      All <code class="code">Highlight</code> components allow for a tag to be
      added at the top-right of the codeblock displaying the language name.
      Customize the language tag using style props. With
      <code class="code">LineNumbers</code>, forward
      <code class="code">langtag</code>
      and
      <code class="code">languageName</code>
      from the parent slot (see Line Numbers above).
    </p>
    <p class="mb-5">Defaults:</p>
    <UnorderedList class="mb-5">
      <ListItem><code class="code">--langtag-top: 0</code></ListItem>
      <ListItem><code class="code">--langtag-right: 0</code></ListItem>
      <ListItem>
        <code class="code">--langtag-background: inherit</code>
      </ListItem>
      <ListItem><code class="code">--langtag-color: inherit</code></ListItem>
      <ListItem><code class="code">--langtag-border-radius: 0</code></ListItem>
      <ListItem><code class="code">--langtag-padding: 1em</code></ListItem>
    </UnorderedList>
    <p class="mb-5">
      See the{" "}
      <Link size="lg" href="/languages">Languages page</Link> for a list of
      supported languages.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte
      code={`<script>
  import { HighlightAuto } from "svelte-highlight";

  $: code = \`body {\n  padding: 0;\n  color: red;\n}\`;
<\/script>

<HighlightAuto {code} langtag \/>`}
      class={THEME_MODULE_NAME}
      langtag
    />
    <br>
    <HighlightSvelte
      code={`<HighlightAuto
  {code}
  langtag
  --langtag-top="0.5rem"
  --langtag-right="0.5rem"
  --langtag-background="linear-gradient(135deg, #2996cf, 80%, white)"
  --langtag-color="#fff"
  --langtag-border-radius="6px"
  --langtag-padding="0.5rem"
/>`}
      class={THEME_MODULE_NAME}
      langtag
      --langtag-top="0.5rem"
      --langtag-right="0.5rem"
      --langtag-background="linear-gradient(135deg, #2996cf, 80%, white)"
      --langtag-color="#fff"
      --langtag-border-radius="6px"
      --langtag-padding="0.5rem"
    />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Loading a Language by Name</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Import a language as a static string when you know it ahead of time—the
      bundler can then split out only the grammars you reference.
    </p>
    <p class="mb-5">
      When the language is known only at <strong>runtime</strong>—a Markdown
      fence, an API field, or a user-selected value—use the
      <code class="code">loadLanguage</code>
      helper to import a grammar by name. It resolves with the language object
      and rejects with an <code class="code">Unknown language</code> error for
      an unrecognized name.
    </p>
    <InlineNotification
      lowContrast
      hideCloseButton
      kind="info"
      title="Note:"
      subtitle="Because the imported name is dynamic, the bundler emits a chunk for every language. Prefer a static import when the language is known ahead of time."
    />
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte
      code={`<script>
  import { Highlight, loadLanguage } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";

  // The language name is not known until runtime.
  export let language = "typescript";
  export let code = "const add = (a, b) => a + b;";
<\/script>

<svelte:head>
  {@html github}
<\/svelte:head>

{#await loadLanguage(language) then grammar}
  <Highlight {code} language={grammar} \/>
{:catch}
  <pre>{code}<\/pre>
{/await}`}
      class={THEME_MODULE_NAME}
    />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Static Mode</h3> </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      <code class="code">svelte-highlight/static</code>
      is a Svelte preprocessor. At build time it replaces
      <code class="code">Highlight</code>
      usages with known <code class="code">code</code> and
      <code class="code">language</code>
      with pre-rendered
      <code class="code">highlight.js</code>
      HTML, so the client never downloads
      <code class="code">highlight.js</code>
      or that grammar module.
    </p>
    <p class="mb-5">Wire it into your Vite/Svelte preprocess config:</p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte
      code={`// vite.config.js
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { highlightStatic } from "svelte-highlight/static";

export default {
  plugins: [svelte({ preprocess: [highlightStatic()] })],
};`}
      class={THEME_MODULE_NAME}
    />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      With a literal <code class="code">code</code> string and a static
      <code class="code">language</code>
      import, the build emits plain HTML:
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte
      code={`<script>
  import Highlight from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
<\/script>

<Highlight language={javascript} code="const x = 1;" />`}
      class={THEME_MODULE_NAME}
    />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      ...into plain HTML, with no <code class="code">highlight.js</code> or
      grammar module shipped to the client:
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte
      code={`<pre class="hljs" data-language="javascript"><code class="hljs"
  ><span class="hljs-keyword">const</span> x = <span class="hljs-number">1</span>;</code
></pre>`}
      class={THEME_MODULE_NAME}
    />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      The static transform runs only when all of these are true:
    </p>
    <UnorderedList class="mb-5">
      <ListItem>
        <code class="code">language</code>
        is a plain identifier bound to a static import from
        <code class="code">svelte-highlight/languages/*</code>.
      </ListItem>
      <ListItem>
        <code class="code">code</code>
        is a string literal or a template literal with no interpolated
        expressions.
      </ListItem>
      <ListItem>
        The element has no default-slot content, no spread props, and no
        <code class="code">bind:</code>/<code class="code">on:</code>/other
        directives.
      </ListItem>
      <ListItem>
        The <code class="code">langtag</code> prop is not used. Static output
        can't pull in <code class="code">langtag.css</code>; that only happens
        when a runtime <code class="code">LangTag</code> is in the bundle.
      </ListItem>
    </UnorderedList>
    <p class="mb-5">
      Dynamic <code class="code">code</code> or
      <code class="code">language</code>,
      <code class="code">loadLanguage</code>,
      <code class="code">HighlightAuto</code>,
      <code class="code">HighlightSvelte</code>, and
      <code class="code">HighlightEditable</code>
      keep the runtime component. No warning.
    </p>
    <p class="mb-5">
      If a usage looks static but fails to resolve or highlight, it falls back
      and calls <code class="code">onWarn</code>:
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightSvelte
      code={`highlightStatic({
  onWarn(message, details) {
    // defaults to a console.warn with the filename, line, and message
  },
});`}
      class={THEME_MODULE_NAME}
    />
    <InlineNotification
      lowContrast
      hideCloseButton
      kind="info"
      title="Note:"
      subtitle="Scope is small on purpose: extra props on Highlight don't carry over to the emitted &lt;pre&gt;, unused imports are left for bundlers to drop, and there's no Astro/MDX fence hook yet."
    />
  </Column>
</Row>

<Row>
  <Column xlg={12}><h3>Examples</h3></Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Get started with{" "}
      <Link
        inline
        size="lg"
        href="https://github.com/metonym/svelte-highlight/tree/master/examples"
        >example set-ups</Link
      >
      , including SvelteKit, Vite, Rollup, Routify, and Webpack.
    </p>
  </Column>
</Row>
