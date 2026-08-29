export type DatalogPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const datalogPreviewSnippets: DatalogPreviewSnippet[] = [
  {
    title: "Transitive closure",
    description: "Souffle directives, a fact, and a recursive rule",
    code: `// transitive closure over an edge relation
.decl edge(x: symbol, y: symbol)
.decl path(x: symbol, y: symbol)
.input edge
edge("a", "b").
edge("b", "c").

path(x, y) :- edge(x, y).
path(x, y) :- path(x, z), edge(z, y), !edge(y, x).

.output path`,
  },
  {
    title: "Type declarations",
    description: ".type and .functor directives",
    code: `.type Name <: symbol
.decl person(name: Name, age: number)
.functor double(x: number): number

person("Ada", 30).
person("Grace", 40).`,
  },
  {
    title: "Query with negation",
    description: "a classic ?- query and negated subgoal",
    code: `?- path(X, "c"), !edge(X, "c").`,
  },
];
