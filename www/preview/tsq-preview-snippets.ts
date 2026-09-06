export type TsqPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const tsqPreviewSnippets: TsqPreviewSnippet[] = [
  {
    title: "Function definition query",
    description: "node names, field names, and captures",
    code: `; match a function definition with a captured name
(function_item
  name: (identifier) @function.name
  parameters: (parameters) @function.params) @function.def

(call_expression
  function: [(identifier) (field_expression)] @call
  !type_arguments)

((identifier) @constant
  (#match? @constant "^[A-Z_]+$"))

(ERROR) @error
_ @any`,
  },
  {
    title: "Predicates",
    description: "eq?, match?, and any-of? directives",
    code: `((identifier) @variable.builtin
  (#any-of? @variable.builtin "self" "this" "super"))

((string) @string.special
  (#not-match? @string.special "^\\\\s*$"))`,
  },
  {
    title: "Anonymous nodes and anchors",
    description: "quoted terminals and the anchor operator",
    code: `(binary_expression
  left: (_) @left
  operator: "+"
  . right: (_) @right)`,
  },
];
