<script>
  import { Row, Column, CodeSnippet } from "carbon-components-svelte";
  import ScopedStyle from "$lib/ScopedStyle.svelte";
</script>

<Row>
  <Column xlg="{12}" lg="{12}">
    <h4>
      svelte-highlight uses highlight.js to provide Svelte components for code
      syntax highlighting.
    </h4>
  </Column>
</Row>

<Row>
  <Column xlg="{10}" lg="{10}">
    <p>
      Install the NPM module as a development dependency using either Yarn or
      NPM.
    </p>
  </Column>
</Row>

<Row>
  <Column xlg="{10}" lg="{10}">
    <p class="mb-5">Using Yarn:</p>
    <Row class="mb-7" noGutter>
      <CodeSnippet code="yarn add -D svelte-highlight" />
    </Row>
    <p class="mb-5">Using NPM:</p>
    <Row class="mb-7" noGutter>
      <CodeSnippet code="npm i -D svelte-highlight" />
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
    <h3>Highlight</h3>
  </Column>
</Row>

<Row>
  <Column xlg="{6}" lg="{6}">
    <p>Regular Highlight</p>
  </Column>
  <Column xlg="{10}" lg="{10}">
    <ScopedStyle name="github" moduleName="github" />
  </Column>
</Row>

<Row>
  <Column>
    <h3>HighlightSvelte</h3>
  </Column>
</Row>

<Row>
  <Column>
    <h3>HighlightAuto</h3>
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
    <h3>Props</h3>
  </Column>
</Row>

<Row>
  <Column>
    <h3>Slots</h3>
  </Column>
</Row>

<Row>
  <Column>
    <h3>Events</h3>
  </Column>
</Row>

<Row noGutter>
  <Column>
    <hr />
  </Column>
</Row>

<Row>
  <Column>
    <h3>TypeScript support</h3>
  </Column>
</Row>
