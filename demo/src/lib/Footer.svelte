<script>
  import { Row, Column, Link } from "carbon-components-svelte";

  const VERSION_PACKAGE = process.env.VERSION_PACKAGE;
  const HOMEPAGE = process.env.HOMEPAGE;
  const NAME = process.env.NAME;
  const TS = process.env.TS;
</script>

<Row>
  <Column xlg="{4}" lg="{4}">
    <span class="mr-3">{NAME} version {VERSION_PACKAGE}</span>
  </Column>
  <Column>
    <Link class="mr-3" href="{HOMEPAGE}" target="_blank">GitHub</Link>
    <Link
      class="mr-3"
      href="https://www.npmjs.com/package/{NAME}"
      target="_blank">NPM</Link
    >
  </Column>
</Row>

<Row>
  <Column>
    <span class="label-01 mr-3">Site last updated {TS}</span>
  </Column>
</Row>
