<script>
  import { Row, Column, Link } from "carbon-components-svelte";
  import ScopedStyle from "$lib/ScopedStyle.svelte";
  import CodeSnippet from "$lib/CodeSnippet.svelte";

  const NAME = process.env.NAME;
</script>

<Row>
  <Column xlg="{16}" lg="{16}">
    <h4 class="mb-7">
      <code class="code">{NAME}</code> provides Svelte components for code syntax highlighting using <Link
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
    <h3>Basic usage</h3>
  </Column>
</Row>

<Row>
  <Column xlg="{6}" lg="{6}">
    <p>Regular Highlight</p>
  </Column>
  <Column noGutter xlg="{10}" lg="{10}">
    <ScopedStyle name="atom-one-dark" moduleName="atomOneDark" />
  </Column>
</Row>

<Row>
  <Column>
    <h3>Svelte syntax highlighting</h3>
  </Column>
</Row>

<Row>
  <Column>
    <h3>Auto-highlighting</h3>
  </Column>
</Row>

<Row noGutter>
  <Column>
    <hr />
  </Column>
</Row>

<Row>
  <Column>
    <h3>API</h3>
  </Column>
</Row>

<Row>
  <Column>
    <h4>Props</h4>
  </Column>
</Row>

<Row>
  <Column>
    <h4>Slots</h4>
  </Column>
</Row>

<Row>
  <Column>
    <h4>Events</h4>
  </Column>
</Row>

<Row noGutter>
  <Column>
    <hr />
  </Column>
</Row>

<Row>
  <Column>
    <h3>Custom language</h3>
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
