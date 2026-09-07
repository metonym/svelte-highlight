export type PowerqueryPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const powerqueryPreviewSnippets: PowerqueryPreviewSnippet[] = [
  {
    title: "A basic query",
    description: "let/in, quoted identifiers, and library functions",
    code: `let
    // load the source table
    Source = Csv.Document(File.Contents("data.csv")),
    #"Changed Type" = Table.TransformColumnTypes(Source, {{"Amount", Int64.Type}}),
    Total = List.Sum(Table.Column(#"Changed Type", "Amount"))
in
    each if Total > 0 then Total else 0
`,
  },
  {
    title: "Hash built-ins and record access",
    description: "#table, #date, and [Field] record access",
    code: `let
    Orders = #table({"Id", "Placed"}, {{1, #date(2026, 1, 15)}}),
    FirstOrder = Orders{0},
    PlacedDate = FirstOrder[Placed]
in
    PlacedDate
`,
  },
  {
    title: "Types and error handling",
    description: "typed parameters, try/otherwise, and string escapes",
    code: `let
    Divide = (x as number, y as number) as number =>
        try x / y otherwise 0,
    Label = "Result: " & Text.From(Divide(10, 2)) & " (100% ""safe"")"
in
    Label
`,
  },
];
