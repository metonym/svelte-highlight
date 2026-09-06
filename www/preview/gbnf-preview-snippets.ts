export type GbnfPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const gbnfPreviewSnippets: GbnfPreviewSnippet[] = [
  {
    title: "A JSON-ish grammar",
    description: "rule definitions, quoted terminals, and character classes",
    code: `# a simple JSON-ish grammar
root ::= object
object ::= "{" pair ("," pair)* "}"
pair ::= string ":" value
value ::= string | number | object
string ::= "\\"" [^"]* "\\""
number ::= [0-9]+ ("." [0-9]+)?`,
  },
  {
    title: "Quantifiers",
    description: "optional, one-or-more, and repetition ranges",
    code: `root ::= greeting name? "!"+
greeting ::= "hi" | "hello"
name ::= [a-zA-Z]{1,20}`,
  },
  {
    title: "Grouping and alternation",
    description: "grouped alternatives inside a rule",
    code: `expr ::= term (("+" | "-") term)*
term ::= factor (("*" | "/") factor)*
factor ::= [0-9]+ | "(" expr ")"`,
  },
];
