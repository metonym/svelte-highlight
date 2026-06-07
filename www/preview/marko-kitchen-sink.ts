export const markoKitchenSink = `class {
  onCreate() {
    this.state = {
      count: 0,
      name: "",
      visible: true,
    };
  }

  increment() {
    this.state.count += 1;
  }

  submit() {
    console.log(this.state.name);
  }
}

<script lang="ts">
type Item = { id: number; label: string };

export function formatItem(item: Item): string {
  return \`\${item.id}: \${item.label}\`;
}
</script>

<style>
  .card {
    padding: 1rem;
    border: 1px solid #ccc;
  }

  .active {
    font-weight: bold;
  }
</style>

<!-- Marko template with expressions and control flow -->
<div class=["card", state.visible && "active"]>
  if (state.visible)
    h1 -- \${input.title || "Untitled"}

  input type="text" value=state.name on-input("updateName") /
  button on-click("increment") -- Count: \${state.count}
  button on-click("submit") -- Submit

  if (state.count === 0)
    p -- Start counting
  else if (state.count < 5)
    p -- Getting started
  else
    p -- \${state.count} clicks

  for (const item of input.items)
    li -- \${formatItem(item)}

  span -- Hello \${state.name || "Anonymous"}!
</div>`;
