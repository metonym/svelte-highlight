import { createRegistry } from "../src/engine.js";

import mermaid from "../src/languages/mermaid";

const registry = createRegistry();

registry.register(mermaid.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "mermaid" }).value;

test("mermaid highlights flowchart keywords and arrows", () => {
  const result = highlight(
    `flowchart LR
  A[Start] --> B{Decision}
  B --> C[End]`,
  );

  expect(result).toContain('<span class="hljs-keyword">flowchart</span>');
  expect(result).toContain('<span class="hljs-keyword">LR</span>');
  expect(result).toContain('<span class="hljs-operator">--&gt;</span>');
});

test("mermaid highlights sequence diagram participants", () => {
  const result = highlight(
    `sequenceDiagram
  participant Alice
  Alice->>Bob: Hello`,
  );

  expect(result).toContain('<span class="hljs-keyword">sequenceDiagram</span>');
  expect(result).toContain('<span class="hljs-keyword">participant</span>');
  expect(result).toContain('<span class="hljs-operator">-&gt;&gt;</span>');
});

test("mermaid highlights comments", () => {
  const result = highlight("%% request flow\nflowchart TD\n  A --> B");

  expect(result).toContain('<span class="hljs-comment">%% request flow</span>');
});

test("mermaid highlights nested subgraphs", () => {
  const result = highlight(
    `flowchart TB
  subgraph cluster
    A --> B
  end`,
  );

  expect(result).toContain('<span class="hljs-keyword">subgraph</span>');
  expect(result).toContain('<span class="hljs-keyword">end</span>');
});
