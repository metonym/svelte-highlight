<script>
  import { THEME_NAME, PKG_NAME, THEME_MODULE_NAME } from "@www/constants";
  import {
    Row,
    Column,
    Link,
    UnorderedList,
    ListItem,
    InlineNotification,
  } from "carbon-components-svelte";
  import Highlight, { HighlightSvelte } from "svelte-highlight";
  import ScopedStyle from "@components/ScopedStyle.svelte";
  import CodeSnippet from "@components/CodeSnippet.svelte";
  import ScopedStyleSvelte from "@components/ScopedStyleSvelte.svelte";
  import ScopedStyleAuto from "@components/ScopedStyleAuto.svelte";
  import Basic from "@components/LineNumbers/Basic.svelte";
  import HideBorder from "@components/LineNumbers/HideBorder.svelte";
  import WrapLines from "@components/LineNumbers/WrapLines.svelte";
  import StyleProps from "@components/LineNumbers/StyleProps.svelte";
  import StartingLineNumber from "@components/LineNumbers/StartingLineNumber.svelte";
  import HighlightedLines from "@components/LineNumbers/HighlightedLines.svelte";
  import HighlightedLinesCustomColor from "@components/LineNumbers/HighlightedLinesCustomColor.svelte";
  import css from "svelte-highlight/languages/css";

  const svelteHeadCdn = `<link
  rel="stylesheet"
  href="https://unpkg.com/svelte-highlight/styles/github.css"
/>\n`;
</script>

<Row>
  <Column xlg={16} lg={16}>
    <p class="text-02">
      Svelte component library for highlighting code using <Link
        inline
        style="font-size: inherit"
        href="https://github.com/highlightjs/highlight.js">highlight.js.</Link
      >
    </p>
  </Column>
</Row>

<Row>
  <Column xlg={12}>
    <h4>Installation</h4>
  </Column>
  <Column xlg={6} lg={6} md={6}>
    <CodeSnippet code="npm i {PKG_NAME}" /><br />
    <CodeSnippet code="pnpm i {PKG_NAME}" /><br />
    <CodeSnippet code="bun add {PKG_NAME}" /><br />
    <CodeSnippet code="yarn add {PKG_NAME}" />
  </Column>
</Row>

<Row>
  <Column>
    <hr />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}>
    <h3>Usage</h3>
  </Column>
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
      Import languages from <code class="code">svelte-highlight/languages</code
      >.
    </p>
    <p class="mb-5">
      See the <Link size="lg" href="/languages">Languages page</Link> for a list
      of supported languages.
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
      Refer to the <Link size="lg" href="/styles">Styles page</Link> for a list of
      supported styles.
    </p>
    <p>
      CSS StyleSheets can also be externally linked from a Content Delivery
      Network (CDN) like <Link size="lg" href="https://unpkg.com/"
        >unpkg.com</Link
      >.
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
  <Column xlg={12}>
    <h3>Svelte Syntax Highlighting</h3>
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use the <code class="code">HighlightSvelte</code> component for Svelte syntax
      highlighting.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <ScopedStyleSvelte name={THEME_NAME} moduleName={THEME_MODULE_NAME} />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}>
    <h3>Auto-highlighting</h3>
  </Column>
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
      the <code class="code">languageNames</code> prop. This can improve performance
      and accuracy.
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
  <Column xlg={12}>
    <h3>Line Numbers</h3>
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use the <code class="code">LineNumbers</code> component to render the highlighted
      code with line numbers.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <Basic />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Set <code class="code">hideBorder</code> to <code class="code">true</code>
      to hide the border of the line numbers column.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HideBorder />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      By default, overflowing horizontal content is contained by a scrollbar.
    </p>
    <p class="mb-5">
      Set <code class="code">wrapLines</code> to <code class="code">true</code>
      to apply a <code class="code">white-space: pre-wrap</code> rule to the
      <code class="code">pre</code> element.
    </p>
  </Column>
  <Column xlg={8} lg={8} md={12}>
    <WrapLines />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">--style-props</code> to customize visual properties.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <StyleProps />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">startingLineNumber</code> to customize the starting
      line number. By default, line numbers start at
      <code class="code">1</code>.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <StartingLineNumber />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">highlightedLines</code> to highlight specific lines.
      Indices start at zero.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightedLines />
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Use <code class="code">--highlighted-background</code> to customize the background
      color of highlighted lines.
    </p>
  </Column>
  <Column xlg={10} lg={10} md={12}>
    <HighlightedLinesCustomColor />
  </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}>
    <h3>Language Targeting</h3>
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      All <code class="code">Highlight</code> components apply a
      <code class="code">data-language</code> attribute on the codeblock containing
      the language name.
    </p>
    <p class="mb-5">This is also compatible with custom languages.</p>
    <p class="mb-5">
      See the <Link size="lg" href="/languages">Languages page</Link> for a list
      of supported languages.
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
  <Column xlg={12}>
    <h3>Language Tags</h3>
  </Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      All <code class="code">Highlight</code> components allow for a tag to be added
      at the top-right of the codeblock displaying the language name. Customize the
      language tag using style props.
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
      See the <Link size="lg" href="/languages">Languages page</Link> for a list
      of supported languages.
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
    <br />
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

<Row>
  <Column xlg={12}><h3>Examples</h3></Column>
  <Column xlg={6} lg={6} md={12}>
    <p class="mb-5">
      Get started with <Link
        inline
        size="lg"
        href="https://github.com/metonym/svelte-highlight/tree/master/examples"
        >example set-ups</Link
      >, including SvelteKit, Vite, Rollup, Routify, and Webpack.
    </p>
  </Column>
</Row>
