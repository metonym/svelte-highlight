<script>
  // @ts-check

  import { PKG_HOMEPAGE, PKG_NAME } from "@www/constants";
  import { Grid, Row, Column, Link } from "carbon-components-svelte";

  const TS = process.env.TS;
</script>

<footer>
  <Grid>
    <Row padding>
      <Column xlg={2} lg={6}>
        <Link class="mr-3" href={PKG_HOMEPAGE} target="_blank">GitHub</Link>
        <Link
          class="mr-3"
          href="https://www.npmjs.com/package/{PKG_NAME}"
          target="_blank"
        >
          NPM
        </Link>
      </Column>
      <Column xlg={8} lg={6}>
        <span class="label-01 mr-3">Site last updated {TS}</span>
      </Column>
    </Row>
  </Grid>
</footer>

<style>
  footer {
    /** Match the padding on .bx--content */
    padding: 0 2rem 2rem;
  }
</style>
