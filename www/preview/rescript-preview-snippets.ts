export type RescriptPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const rescriptPreviewSnippets: RescriptPreviewSnippet[] = [
  {
    title: "Types and pattern matching",
    description: "variants, records, and switch",
    code: `type shape =
  | Circle(float)
  | Rectangle(float, float)

let area = shape =>
  switch shape {
  | Circle(r) => 3.14 *. r *. r
  | Rectangle(w, h) => w *. h
  }`,
  },
  {
    title: "Bindings and polymorphic variants",
    description: "let bindings, decorators, and JSX-friendly syntax",
    code: `@react.component
let make = (~name) => {
  let color = #Blue
  let greeting = "Hello, " ++ name
  <div className="greeting"> {React.string(greeting)} </div>
}`,
  },
  {
    title: "Recursive let bindings",
    description: 'let rec correctly titles the function, not "rec"',
    code: `let rec factorial = n =>
  switch n {
  | 0 => 1
  | n => n * factorial(n - 1)
  }`,
  },
];
