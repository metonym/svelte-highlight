<script>
  import { PKG_HOMEPAGE, PKG_NAME } from "@www/constants";
  import { Row, Column, Link } from "carbon-components-svelte";

  const TS = process.env.TS;
</script>

<Row>
  <Column>
    <Link class="mr-3" href={PKG_HOMEPAGE} target="_blank">GitHub</Link>
    <Link
      class="mr-3"
      href="https://www.npmjs.com/package/{PKG_NAME}"
      target="_blank"
    >
      NPM
    </Link>
  </Column>
</Row>

<Row>
  <Column>
    <span class="label-01 mr-3">Site last updated {TS}</span>
  </Column>
</Row>
