<script>
  // @ts-check

  import { PKG_HOMEPAGE, PKG_NAME, TS } from "@www/constants";
  import { Grid, Row, Column, Link } from "carbon-components-svelte";
</script>

<footer>
  <Grid padding>
    <Row>
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
        <span class="label-01 text-02">Site last updated {TS}</span>
      </Column>
    </Row>
  </Grid>
</footer>

<style>
  footer {
    /** Match the padding on .bx--content */
    padding: 0 2rem 2rem;
  }

  @media (max-width: 1056px) {
    footer {
      padding-left: 0;
      padding-right: 0;
    }
  }
</style>
