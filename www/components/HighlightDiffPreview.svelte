<script>
  import DiffBeforeAfter from "@components/HighlightDiff/BeforeAfter.svelte";
  import DiffUnified from "@components/HighlightDiff/Unified.svelte";
  import { Column, Row } from "carbon-components-svelte";
</script>

<Row class="mb-9">
  <Column xlg={12}> <h3>Unified diff</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <DiffUnified /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}>
    <h3>Before/after, with a collapsed unchanged run</h3>
  </Column>
  <Column xlg={12} lg={12} md={12}> <DiffBeforeAfter /> </Column>
</Row>
