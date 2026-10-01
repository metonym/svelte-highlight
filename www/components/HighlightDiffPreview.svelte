<script>
  import DiffBeforeAfter from "@components/HighlightDiff/BeforeAfter.svelte";
  import DiffMultipleChanges from "@components/HighlightDiff/MultipleChanges.svelte";
  import DiffPureAddition from "@components/HighlightDiff/PureAddition.svelte";
  import DiffPureDeletion from "@components/HighlightDiff/PureDeletion.svelte";
  import DiffUnified from "@components/HighlightDiff/Unified.svelte";
  import DiffUnifiedGutter from "@components/HighlightDiff/UnifiedGutter.svelte";
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

<Row class="mb-9">
  <Column xlg={12}>
    <h3>gutter="unified" (single column, falls back to the old-file number)</h3>
  </Column>
  <Column xlg={12} lg={12} md={12}> <DiffUnifiedGutter /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Pure addition, all four gutter modes</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <DiffPureAddition /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}> <h3>Pure deletion, all four gutter modes</h3> </Column>
  <Column xlg={12} lg={12} md={12}> <DiffPureDeletion /> </Column>
</Row>

<Row class="mb-9">
  <Column xlg={12}>
    <h3>Multiple separate changes in one hunk, all four gutter modes</h3>
  </Column>
  <Column xlg={12} lg={12} md={12}> <DiffMultipleChanges /> </Column>
</Row>
