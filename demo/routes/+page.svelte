<script>
  /** @type {import('./$types').PageData} */
  export const data = null;

  import { base } from "$app/paths";
  import {
    Tabs,
    Tab,
    TabContent,
    Row,
    Column,
    Link,
    UnorderedList,
    ListItem,
    InlineNotification,
  } from "carbon-components-svelte";
  import { HighlightSvelte, HighlightAuto } from "svelte-highlight";
  import ScopedStyle from "lib/ScopedStyle.svelte";
  import CodeSnippet from "lib/CodeSnippet.svelte";
  import ScopedStyleSvelte from "lib/ScopedStyleSvelte.svelte";
  import ScopedStyleAuto from "lib/ScopedStyleAuto.svelte";
  import Basic from "lib/LineNumbers/Basic.svelte";
  import HideBorder from "lib/LineNumbers/HideBorder.svelte";
  import WrapLines from "lib/LineNumbers/WrapLines.svelte";
  import StyleProps from "lib/LineNumbers/StyleProps.svelte";

  const NAME = process.env.NAME;

  const svelteHeadCdn = `<link
  rel="stylesheet"
  href="https://unpkg.com/svelte-highlight/styles/github.css"
/>\n`;
</script>

<Row>
  <Column xlg={16} lg={16}>
    <h4 class="mb-7">
      Syntax Highlighting for Svelte using <Link
        inline
        style="font-size: inherit"
        href="https://github.com/highlightjs/highlight.js">highlight.js</Link
      >.
    </h4>
  </Column>
</Row>

<Row>
  <Column>
    <h3>Installation</h3>
  </Column>
</Row>

<Row>
  <Column xlg={9} lg={12}>
    <Tabs>
      <Tab label="Yarn" />
      <Tab label="NPM" />
      <Tab label="pnpm" />
      <div slot="content" style="margin: 1rem -1rem">
        <TabContent>
          <CodeSnippet code="yarn add -D {NAME}" />
        </TabContent>
        <TabContent>
          <CodeSnippet code="npm i -D {NAME}" />
        </TabContent>
        <TabContent>
          <CodeSnippet code="pnpm i -D {NAME} highlight.js" />
        </TabContent>
      </div>
    </Tabs>
  </Column>
</Row>

<Row>
  <Column>
    <h3>Usage</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg={9} lg={12}>
    <p class="mb-5">The default Highlight component requires two props:</p>
    <UnorderedList class="mb-5">
      <ListItem><code class="code">code</code>: text to highlight</ListItem>
      <ListItem>
        <code class="code">language</code>: language used to highlight the text
      </ListItem>
    </UnorderedList>
    <p class="mb-5">
      Import languages from <code class="code"
        >"svelte-highlight/src/languages"</code
      >.
    </p>
    <p class="mb-5">
      See the <Link size="lg" href="{base}/languages">Languages page</Link> for a
      list of supported languages.
    </p>
  </Column>
  <Column xlg={12}>
    <ScopedStyle name="atom-one-dark" moduleName="atomOneDark" />
  </Column>
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      Import styles from <code class="code">"svelte-highlight/src/styles"</code
      >.
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
      Refer to the <Link size="lg" href="{base}/styles">Styles page</Link> for a
      list of supported styles.
    </p>
    <p>
      CSS StyleSheets can also be externally linked from a Content Delivery
      Network (CDN) like <Link size="lg" href="https://unpkg.com/"
        >unpkg.com</Link
      >.
    </p>
    <InlineNotification
      lowContrast
      hideCloseButton
      kind="warning"
      title="Note:"
      subtitle="Using a CDN is best suited for prototyping and not recommended for production use."
    />
  </Column>
  <Column xlg={12}>
    <HighlightSvelte code={svelteHeadCdn} class="atomOneDark" />
  </Column>
</Row>

<Row>
  <Column>
    <h3>Svelte Syntax Highlighting</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      Use the <code class="code">HighlightSvelte</code> component for Svelte syntax
      highlighting.
    </p>
  </Column>
  <Column xlg={12}>
    <ScopedStyleSvelte name="atom-one-dark" moduleName="atomOneDark" />
  </Column>
</Row>

<Row>
  <Column>
    <h3>Auto-highlighting</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      The <code class="code">HighlightAuto</code> component invokes the
      <code class="code">highlightAuto</code>
      API from <code class="code">highlight.js</code>.
    </p>
    <InlineNotification
      lowContrast
      hideCloseButton
      kind="warning"
      title="Note:"
      subtitle="Auto-highlighting will result in a larger bundle size. Specify a language if possible."
    />
  </Column>
  <Column xlg={12}>
    <ScopedStyleAuto name="atom-one-dark" moduleName="atomOneDark" />
  </Column>
</Row>

<Row>
  <Column>
    <h3>Line Numbers</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      Use the <code class="code">LineNumbers</code> component to render the highlighted
      code with line numbers.
    </p>
  </Column>
  <Column xlg={12}>
    <Basic />
  </Column>
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      Set <code class="code">hideBorder</code> to <code class="code">true</code>
      to hide the border of the line numbers column.
    </p>
  </Column>
  <Column xlg={12}>
    <HideBorder />
  </Column>
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      By default, overflowing horizontal content is contained by a scrollbar.
    </p>
    <p class="mb-5">
      Set <code class="code">wrapLines</code> to <code class="code">true</code>
      to apply a <code class="code">white-space: pre-wrap</code> rule to the
      <code class="code">pre</code> element.
    </p>
  </Column>
  <Column xlg={8}>
    <WrapLines />
  </Column>
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      Use <code class="code">--style-props</code> to customize visual properties.
    </p>
  </Column>
  <Column xlg={12}>
    <StyleProps />
  </Column>
</Row>

<Row>
  <Column>
    <h3>Language Targeting</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      All <code class="code">Highlight</code> components apply a
      <code class="code">data-language</code> attribute on the codeblock containing
      the language name.
    </p>
    <p class="mb-5">This is also compatible with custom languages.</p>
    <p class="mb-5">
      See the <Link size="lg" href="{base}/languages">Languages page</Link> for a
      list of supported languages.
    </p>
  </Column>
  <Column xlg={12}>
    <HighlightAuto
      code={'[data-language="css"] {\n  /* custom style rules */\n}'}
      class="atomOneDark"
    />
  </Column>
</Row>

<Row>
  <Column>
    <h3>Language Tags</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      All <code class="code">Highlight</code> components allow for a tag to be added
      at the top-right of the codeblock displaying the language name.
    </p>
    <p class="mb-5">
      Customize the language tag <code class="code">background</code>,
      <code class="code">color</code>, and
      <code class="code">border-radius</code> using style props.
    </p>
    <p class="mb-5">This is also compatible with custom languages.</p>
    <p class="mb-5">
      It is recommended that you set values for
      <code class="code">--hljs-background</code> and
      <code class="code">--hljs-foreground</code> to ensure the langtags remain readable
      on any theme.
    </p>
    <p class="mb-5">Defaults:</p>
    <UnorderedList class="mb-5">
      <ListItem><code class="code">--hljs-background: inherit</code></ListItem>
      <ListItem><code class="code">--hljs-foreground: inherit</code></ListItem>
      <ListItem><code class="code">--hljs-border-radius: 0</code></ListItem>
    </UnorderedList>
    <p class="mb-5">
      See the <Link size="lg" href="{base}/languages">Languages page</Link> for a
      list of supported languages.
    </p>
  </Column>
  <Column xlg={12}>
    <HighlightSvelte
      code={`<script>
  import { HighlightAuto } from "svelte-highlight";

   $: code = \`body {\n  padding: 0;\n  color: red;\n}\`;
<\/script>

<HighlightAuto {code} langtag="{true}" \/>`}
      class="atomOneDark"
      langtag={true}
    />
    <HighlightAuto
      code={`[data-language="css"] {
  --hljs-background: linear-gradient(135deg, #2996cf, 80%, white);
  --hljs-foreground: #fff;
  --hljs-radius: 8px;
}`}
      class="atomOneDark"
      langtag={true}
    />
  </Column>
</Row>

<Row>
  <Column xlg={9} lg={12}>
    <h3 class="mb-7">Examples</h3>
    <p class="mb-5">
      Example set-ups – including SvelteKit, Vite, Rollup, and Webpack – are
      located in the
      <Link
        inline
        size="lg"
        href="https://github.com/metonym/svelte-highlight/tree/master/examples"
      >
        examples folder in the GitHub repository
      </Link>.
    </p>
  </Column>
</Row>

<Row>
  <Column xlg={9} lg={12}>
    <h3 class="mb-7">License</h3>
    <p class="mb-5">MIT</p>
  </Column>
</Row>

<Row>
  <Column>
    <hr />
  </Column>
</Row>
