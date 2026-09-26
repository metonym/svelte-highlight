<script>
  import Basic from "@components/CodeToolbar/Basic.svelte";
  import InCodeWindow from "@components/CodeToolbar/InCodeWindow.svelte";
  import Sticky from "@components/CodeToolbar/Sticky.svelte";
  import { Column, Row } from "carbon-components-svelte";
</script>

<Row class="mb-9">
  <Column xlg={12}> <h3>Basic</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Basic /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Composing with CodeWindow</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <InCodeWindow /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Sticky in a scrolling container</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Sticky /> </Column>
</Row>
