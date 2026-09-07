export type DjotPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const djotPreviewSnippets: DjotPreviewSnippet[] = [
  {
    title: "A basic document",
    description: "headings, emphasis, lists, and attributes",
    code: `# A demo document

This is *strong* and _emphasis_ and \`verbatim\`.

- first item
- [x] task done

> a block quote

{.note #intro}
A paragraph with an attribute block above it.

See the [docs](https://example.com) for more :smile:
`,
  },
  {
    title: "Inline formatting",
    description: "superscript, subscript, highlight, insert, and delete",
    code: `E = mc^2^ and H~2~O are common examples.

{=highlighted text=}, {+inserted text+}, and {-deleted text-}.

Explicit {*strong*} and {_emphasis_} forms disambiguate word boundaries.
`,
  },
  {
    title: "Fenced divs and math",
    description: "::: fenced divs, $$ math blocks, and footnotes",
    code: `::: warning
This is a warning admonition.
:::

The quadratic formula is $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$

Here's a claim needing a citation[^1].

[^1]: This is the footnote text.
`,
  },
];
