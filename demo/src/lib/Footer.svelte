<script>
  import { Row, Column, OutboundLink } from "carbon-components-svelte";

  const HOMEPAGE = process.env.HOMEPAGE;
  const NAME = process.env.NAME;
</script>

<Row>
  <Column>
    <OutboundLink  class="mr-3" href="{HOMEPAGE}">GitHub</OutboundLink>
    <OutboundLink  class="mr-3" href="https://www.npmjs.com/package/{NAME}">NPM</OutboundLink>
  </Column>
</Row>
