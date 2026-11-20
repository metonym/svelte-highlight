<script>
  import Basic from "@components/CodeToolbar/Basic.svelte";
  import CustomActions from "@components/CodeToolbar/CustomActions.svelte";
  import InCodeWindow from "@components/CodeToolbar/InCodeWindow.svelte";
  import { Column, Row } from "carbon-components-svelte";
</script>

<Row class="mb-9">
  <Column xlg={12}><h3>Basic</h3></Column>
  <Column xlg={12} lg={12} md={12}><Basic /></Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}><h3>Custom actions</h3></Column>
  <Column xlg={12} lg={12} md={12}><CustomActions /></Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}><h3>Inside CodeWindow</h3></Column>
  <Column xlg={12} lg={12} md={12}><InCodeWindow /></Column>
</Row>
