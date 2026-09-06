export type CodeqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const codeqlPreviewSnippets: CodeqlPreviewSnippet[] = [
  {
    title: "Unused variable query",
    description: "a QLDoc header, a predicate check, and a select placeholder",
    code: `/**
 * @name Unused variable
 * @kind problem
 * @problem.severity warning
 */
import javascript

from Variable v
where not exists(VarAccess a | a.getVariable() = v)
select v, "Unused variable $@.", v, v.getName()
`,
  },
  {
    title: "A predicate",
    description: "a reusable predicate definition",
    code: `predicate isEven(int x) {
  x % 2 = 0
}`,
  },
  {
    title: "Aggregations",
    description: "count and exists in a where clause",
    code: `from Function f
where count(f.getAParameter()) > 5
select f, "Too many parameters"`,
  },
];
