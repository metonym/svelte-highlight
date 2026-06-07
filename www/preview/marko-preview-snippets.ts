export type MarkoPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const markoPreviewSnippets: MarkoPreviewSnippet[] = [
  {
    title: "Dollar-brace expressions",
    description: "Dollar-brace expressions in markup",
    code: `<div class=input.className>
  Hello \${input.name}!
</div>`,
  },
  {
    title: "Script block",
    description: "<script> with CommonJS or ES module code",
    code: `<script>
module.exports = {
  onCreate() {
    this.state = { count: 0 };
  },
  increment() {
    this.state.count += 1;
  },
};
</script>

<button on-click('increment')>
  \${state.count}
</button>`,
  },
  {
    title: "TypeScript script block",
    description: '<script lang="ts">',
    code: `<script lang="ts">
type Item = { id: number; label: string };

export function formatItem(item: Item): string {
  return \`\${item.id}: \${item.label}\`;
}
</script>`,
  },
  {
    title: "Control flow",
    description: "if / else blocks in Marko templates",
    code: `<div>
  if (condition)
    p -- Yes
  else
    p -- No
</div>`,
  },
  {
    title: "Class component and styles",
    description: "class { } syntax with CSS block",
    code: `class {
  onCreate() {
    this.state = { count: 0 };
  }
  increment() {
    this.state.count += 1;
  }
}

<style>
  .card {
    color: red;
  }
</style>

<div class="card">
  \${state.count}
</div>`,
  },
];
