export type DhallPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const dhallPreviewSnippets: DhallPreviewSnippet[] = [
  {
    title: "Typed config",
    description: "let bindings, records, and builtin types",
    code: `let Port : Type = Natural

let Server =
  { host : Text, port : Port, tls : Bool }

let defaults : Server =
  { host = "localhost", port = 8080, tls = False }

in  defaults // { tls = True }`,
  },
  {
    title: "Functions and lists",
    description: "lambdas, List/map, and string interpolation",
    code: `let makeUrl =
  \\(host : Text) -> \\(port : Natural) -> "https://\${host}:\${Natural/show port}"

let hosts = [ "a.example.com", "b.example.com" ]

in  List/map Text Text (\\(h : Text) -> makeUrl h 443) hosts`,
  },
];
