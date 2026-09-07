export type TextprotoPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const textprotoPreviewSnippets: TextprotoPreviewSnippet[] = [
  {
    title: "A basic message",
    description: "header comments, fields, and a nested message block",
    code: `# proto-file: example.proto
# proto-message: Person

name: "Alice"
age: 30
active: true
scores: [95, 87, 100]

address {
  city: "Springfield"
  zip: "00000"
}
`,
  },
  {
    title: "Extension fields",
    description: "a qualified extension field and an Any-type message",
    code: `[com.example.ext.special_field]: "extended"

[type.googleapis.com/pkg.Msg] {
  detail: "packed message"
}
`,
  },
  {
    title: "Numbers and enums",
    description: "special number forms and bare enum values",
    code: `status: ACTIVE
ratio: 1.5e3
flags: 0xFF
weight: inf
error_rate: nan
`,
  },
];
