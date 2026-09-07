export type GraphvizPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const graphvizPreviewSnippets: GraphvizPreviewSnippet[] = [
  {
    title: "A basic pipeline",
    description: "a digraph with a subgraph cluster and edge attributes",
    code: `// a simple pipeline
digraph pipeline {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];

  subgraph cluster_build {
    label="build";
    compile -> test;
  }

  test -> deploy [label="on success", color=green];
  deploy -> "prod:n" [style=dashed];
}
`,
  },
  {
    title: "An undirected graph",
    description: "graph keyword with -- edges and node styling",
    code: `graph social {
  node [shape=circle, style=filled, fillcolor=lightblue];

  alice -- bob;
  bob -- carol;
  carol -- alice [color=red, penwidth=2];
}
`,
  },
  {
    title: "HTML-like labels",
    description: "an HTML label and port references",
    code: `digraph structs {
  node [shape=record];

  struct1 [label=<
    <table>
      <tr><td>left</td><td port="f1">mid</td><td>right</td></tr>
    </table>
  >];

  struct1:f1 -> struct2;
}
`,
  },
];
