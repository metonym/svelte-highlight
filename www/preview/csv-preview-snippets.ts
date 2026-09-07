export type CsvPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const csvPreviewSnippets: CsvPreviewSnippet[] = [
  {
    title: "A basic table",
    description: "quoted fields with escapes, literals, and dates",
    code: `id,name,active,joined,notes
1,"Alice ""Al"" Smith",true,2026-01-15,
2,Bob,false,2025-12-01,"NA"
3,Carol,,2026-03-02T10:00:00Z,NULL
`,
  },
  {
    title: "Tab-separated values",
    description: "the same data with tab separators",
    code: `id\tname\tscore
1\tAlice\t92
2\tBob\t88
`,
  },
  {
    title: "Semicolon-separated values",
    description: "a locale that uses ; as the field separator",
    code: `id;name;price
1;Widget;19.99
2;Gadget;24.5
`,
  },
];
