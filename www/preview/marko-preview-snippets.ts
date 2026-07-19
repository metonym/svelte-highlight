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
    title: "Concise mode with class/id shorthand",
    description: "tagname.class and tagname#id, without angle brackets",
    code: `div.container
  h1#title.large -- \${input.title}
  input#email.required type="email" value=input.email
  button.btn.btn-primary on-click("submit") -- Submit`,
  },
  {
    title: "Control flow",
    description: "if / else-if / else blocks in Marko templates",
    code: `<div>
  if (input.count > 0)
    p -- Positive
  else-if (input.count === 0)
    p -- Zero
  else
    p -- Negative
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
