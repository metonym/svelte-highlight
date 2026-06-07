export const mdxKitchenSink = `import { Tabs, TabItem } from "@components/Tabs";
import { Chart } from "./chart";
import type { Point } from "./types";

export const meta = {
  title: "Kitchen sink",
  description: "MDX grammar preview",
};

# {meta.title}

Welcome to the **MDX** preview. This page mixes \`markdown\`, JSX, and JavaScript.

## Features

- import / export statements
- **bold** and \`inline code\`
- JSX components
- {expressions} in prose

## Counter

export const initialCount = 0;

The current count is **{count}**.

<button onClick={() => setCount((c) => c + 1)}>Increment</button>

## Chart

<Chart
  data={[
    { x: 0, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 2 },
  ]}
  title={meta.title}
/>

## Code sample

\`\`\`javascript
const total = items.reduce((sum, item) => sum + item.value, 0);
console.log(\`Total: \${total}\`);
\`\`\`

## List rendering

<ul>
  {["alpha", "beta", "gamma"].map((label) => (
    <li key={label}>{label.toUpperCase()}</li>
  ))}
</ul>

<Tabs>
  <TabItem label="One">First tab</TabItem>
  <TabItem label="Two">Second tab</TabItem>
</Tabs>

<!-- HTML comments are preserved -->`;
