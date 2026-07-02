export type NickelPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const nickelPreviewSnippets: NickelPreviewSnippet[] = [
  {
    title: "Contracts and records",
    description: "let bindings, annotations, and merging",
    code: `let Port = std.contract.from_predicate (fun p =>
  std.is_number p && p > 0 && p < 65536) in

{
  host | String = "localhost",
  port | Port = 8080,
  url = "http://%{host}:%{std.to_string port}",
}`,
  },
  {
    title: "Functions and enums",
    description: "fun expressions and enum tags",
    code: `let classify = fun n =>
  if n > 0 then 'Positive
  else if n < 0 then 'Negative
  else 'Zero in

{
  result = classify 42,
  values = std.array.map (fun x => x * 2) [1, 2, 3],
}`,
  },
  {
    title: "Multiline strings",
    description: 'm%"..."% strings with a matching %-count delimiter',
    code: `let template = m%"
  Use %{host} with a literal "%" sign here.
  "%
in
{ rendered = template }`,
  },
];
