<script>
  import AutoScroll from "@components/HighlightStream/AutoScroll.svelte";
  import Basic from "@components/HighlightStream/Basic.svelte";
  import Caret from "@components/HighlightStream/Caret.svelte";
  import Controls from "@components/HighlightStream/Controls.svelte";
  import Retokenize from "@components/HighlightStream/Retokenize.svelte";
  import Stepper from "@components/HighlightStream/Stepper.svelte";
  import { Column, Row } from "carbon-components-svelte";
</script>

<Row class="mb-9">
  <Column xlg={12}> <h3>Basic</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Basic /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Chunk-by-chunk stepper</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Stepper /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Re-tokenizing a multi-line construct</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Retokenize /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Speed &amp; auto-scroll controls</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Controls /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Auto-scroll in a fixed-height window</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <AutoScroll /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Custom caret</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Caret /> </Column>
</Row>
