<script>
  import Basic from "@components/MarkdownStream/Basic.svelte";
  import Regenerate from "@components/MarkdownStream/Regenerate.svelte";
  import { Column, Row } from "carbon-components-svelte";
</script>

<Row class="mb-9">
  <Column xlg={12}> <h3>Basic</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Basic /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Regenerating a fence</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Regenerate /> </Column>
</Row>
