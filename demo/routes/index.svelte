<script>
  import {
    Row,
    Column,
    Link,
    UnorderedList,
    ListItem,
  } from "carbon-components-svelte";
  import ScopedStyle from "$lib/ScopedStyle.svelte";
  import CodeSnippet from "$lib/CodeSnippet.svelte";
  import { base } from "$app/paths";
  import ScopedStyleSvelte from "$lib/ScopedStyleSvelte.svelte";
  import ScopedStyleAuto from "$lib/ScopedStyleAuto.svelte";
  import HighlightSvelte from "../../src/HighlightSvelte.svelte";
  import HighlightAuto from "../../src/HighlightAuto.svelte";

  const NAME = process.env.NAME;

  const sveltekit = `export default {
  kit: {
    target: "#svelte",
    vite: {
      optimizeDeps: {
        include: ["highlight.js/lib/core"],
      },
    },
  },
};`;
</script>

<Row>
  <Column xlg={16} lg={16}>
    <h4 class="mb-7">
      <code class="code">{NAME}</code> provides Svelte components for code
      syntax highlighting using <Link
        inline
        style="font-size: inherit"
        rel="external"
        href="https://github.com/highlightjs/highlight.js">highlight.js</Link
      >.
    </h4>
  </Column>
</Row>

<Row>
  <Column xlg={9} lg={12}>
    <p class="mb-5">Install using Yarn:</p>
    <Row class="mb-7" noGutter>
      <CodeSnippet code="yarn add -D {NAME}" />
    </Row>
    <p class="mb-5">Install using NPM:</p>
    <Row class="mb-7" noGutter>
      <CodeSnippet code="npm i -D {NAME}" />
    </Row>
  </Column>
</Row>

<Row noGutter>
  <Column>
    <hr />
  </Column>
</Row>

<Row>
  <Column>
    <h3>SvelteKit Set-up</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      To use this library with SvelteKit, add <code class="code"
        >"highlight.js/lib/core"</code
      >
      to the dependencies for vite to optimize in your
      <strong>svelte.config.js</strong>:
    </p>

    <Row class="mb-7" noGutter>
      <CodeSnippet type="multi" code={sveltekit} />
    </Row>

    <p class="mb-5">
      Refer to the <Link
        inline
        size="lg"
        rel="external"
        href="https://github.com/metonym/svelte-highlight/tree/master/examples/sveltekit"
      >
        SvelteKit example set-up
      </Link>.
    </p>
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
      Languages can be found in <code class="code"
        >"svelte-highlight/src/languages"</code
      >.
    </p>
    <p class="mb-5">
      See the <Link size="lg" href="{base}/languages">Languages page</Link> for a
      list of supported languages.
    </p>
  </Column>
  <Column noGutter xlg={12}>
    <ScopedStyle name="atom-one-dark" moduleName="atomOneDark" />
  </Column>
  <Column xlg={9} lg={12}>
    <p class="mb-5">
      Styles can be imported from <code class="code"
        >"svelte-highlight/src/styles"</code
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
  <Column noGutter xlg={12}>
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
  </Column>
  <Column noGutter xlg={12}>
    <ScopedStyleAuto name="atom-one-dark" moduleName="atomOneDark" />
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
  <Column noGutter xlg={12}>
    <HighlightAuto
      code={'pre[data-language="css"] {\n  /* custom style rules */\n}'}
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
      The language tag can be given a custom <code class="code">background</code
      >, <code class="code">color</code>, and
      <code class="code">border-radius</code> through the custom properties shown.
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
  <Column noGutter xlg={12}>
    <HighlightSvelte
      code={`<script>
  import { HighlightAuto } from "svelte-highlight";

   $: code = \`.body { padding: 0; margin: 0; }\`;
<\/script>

<HighlightAuto {code} langtag="{true}" \/>`}
      class="atomOneDark"
      langtag={true}
    />
    <HighlightAuto
      code={`pre[data-language="css"] {
  --hljs-background: linear-gradient(135deg, #2996cf, 80%, white);
  --hljs-foreground: #fff;
  --hljs-radius: 8px;
}`}
      class="atomOneDark"
      langtag={true}
    />
  </Column>
</Row>

<Row noGutter>
  <Column>
    <hr />
  </Column>
</Row>

<Row>
  <Column xlg={9} lg={12}>
    <h3 class="mb-7">TypeScript Support</h3>
    <p class="mb-5">
      Svelte version 3.31 or greater is required to use this library with
      TypeScript.
    </p>
    <p class="mb-5">
      TypeScript definitions are located in the <Link
        inline
        size="lg"
        rel="external"
        href="https://github.com/metonym/svelte-highlight/tree/master/src"
        >src folder in the GitHub repository</Link
      >.
    </p>
  </Column>
</Row>

<Row>
  <Column xlg={9} lg={12}>
    <h3 class="mb-7">Examples</h3>
    <p class="mb-5">
      Example set-ups – including SvelteKit, Rollup, Webpack, and Snowpack – are
      located in the
      <Link
        inline
        size="lg"
        rel="external"
        href="https://github.com/metonym/svelte-highlight/tree/master/examples"
        >examples folder in the GitHub repository</Link
      >.
    </p>
  </Column>
</Row>

<Row>
  <Column xlg={9} lg={12}>
    <h3 class="mb-7">License</h3>
    <p class="mb-5">MIT</p>
  </Column>
</Row>

<Row noGutter>
  <Column>
    <hr />
  </Column>
</Row>
