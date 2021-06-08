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

  const NAME = process.env.NAME;

  const sveltekit = `vite: {
  optimizeDeps: {
    include: ["highlight.js/lib/core"],
  },
}`;
</script>

<Row>
  <Column xlg="{16}" lg="{16}">
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
  <Column xlg="{10}" lg="{10}">
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
    <h3>SvelteKit set-up</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg="{10}" lg="{10}">
    <p class="mb-5">
      To use this library with SvelteKit, add the following to the kit field in
      your
      <strong>svelte.config.js</strong>:
    </p>

    <Row class="mb-7" noGutter>
      <CodeSnippet type="multi" code="{sveltekit}" />
    </Row>

    <p class="mb-5">
      Refer to the <Link
        inline
        size="lg"
        rel="external"
        href="https://github.com/metonym/svelte-highlight/tree/master/examples/sveltekit"
      >
        SvelteKit example
      </Link> for a sample set-up.
    </p>
  </Column>
</Row>

<Row>
  <Column>
    <h3>Basic usage</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg="{10}" lg="{10}">
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
  <Column noGutter>
    <ScopedStyle name="atom-one-dark" moduleName="atomOneDark" />
  </Column>
  <Column xlg="{10}" lg="{10}">
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
    <h3>Svelte syntax highlighting</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg="{10}" lg="{10}">
    <p class="mb-5">
      Use the <code class="code">HighlightSvelte</code> component for Svelte syntax
      highlighting.
    </p>
  </Column>
  <Column noGutter>
    <ScopedStyleSvelte name="atom-one-dark" moduleName="atomOneDark" />
  </Column>
</Row>

<Row>
  <Column>
    <h3>Auto-highlighting</h3>
  </Column>
</Row>

<Row class="mb-7">
  <Column xlg="{10}" lg="{10}">
    <p class="mb-5">
      The <code class="code">HighlightAuto</code> component invokes the
      <code class="code">highlightAuto</code>
      API from <code class="code">highlight.js</code>.
    </p>
  </Column>
  <Column noGutter>
    <ScopedStyleAuto name="atom-one-dark" moduleName="atomOneDark" />
  </Column>
</Row>

<Row noGutter>
  <Column>
    <hr />
  </Column>
</Row>

<Row>
  <Column>
    <h3 class="mb-7">TypeScript support</h3>
    <p class="mb-5">
      Svelte version 3.31 or greater is required to use this library with
      TypeScript.
    </p>
    <p class="mb-5">
      TypeScript definitions are located in the <Link
        inline
        size="lg"
        rel="external"
        href="https://github.com/metonym/svelte-highlight/tree/master/types"
        >types folder in the GitHub repository</Link
      >.
    </p>
  </Column>
</Row>

<Row>
  <Column>
    <h3 class="mb-7">License</h3>
    <p class="mb-5">MIT</p>
  </Column>
</Row>

<Row noGutter>
  <Column>
    <hr />
  </Column>
</Row>
