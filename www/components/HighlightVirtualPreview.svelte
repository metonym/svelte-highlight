<script>
  import Basic from "@components/HighlightVirtual/Basic.svelte";
  import CodeSwap from "@components/HighlightVirtual/CodeSwap.svelte";
  import Controls from "@components/HighlightVirtual/Controls.svelte";
  import Headless from "@components/HighlightVirtual/Headless.svelte";
  import InsideCodeWindow from "@components/HighlightVirtual/InsideCodeWindow.svelte";
  import Languages from "@components/HighlightVirtual/Languages.svelte";
  import { Column, Row } from "carbon-components-svelte";
</script>

<Row class="mb-9">
  <Column xlg={12}> <h3>Basic: a 50,000-line JSON log</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Basic /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}>
    <h3>overscan / checkpointInterval / random access</h3>
  </Column>
  <Column xlg={12} lg={12} md={12}> <Controls /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Across languages</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <Languages /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Swapping documents</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <CodeSwap /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Composing with CodeWindow</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <InsideCodeWindow /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}>
    <h3>Headless: svelte-highlight/tokenized-document</h3>
  </Column>
  <Column xlg={12} lg={12} md={12}> <Headless /> </Column>
</Row>
