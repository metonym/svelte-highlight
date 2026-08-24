export type MermaidPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const mermaidPreviewSnippets: MermaidPreviewSnippet[] = [
  {
    title: "Flowchart",
    description: "nodes, arrows, and a subgraph",
    code: `%% request flow
flowchart LR
  A[Client] --> B{API}
  subgraph cluster
    B --> C[(Database)]
  end`,
  },
  {
    title: "Sequence diagram",
    description: "participants and messages",
    code: `sequenceDiagram
  participant Alice
  participant Bob
  Alice->>Bob: Hello
  Bob-->>Alice: Hi`,
  },
  {
    title: "Class diagram",
    description: "types and relationships",
    code: `classDiagram
  class User {
    +String name
    +login()
  }
  User --> Account`,
  },
];
