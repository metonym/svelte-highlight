export type OrgPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const orgPreviewSnippets: OrgPreviewSnippet[] = [
  {
    title: "A basic headline",
    description: "TODO keyword, priority, tags, and a property drawer",
    code: `* TODO Write quarterly report [#A]           :work:report:
SCHEDULED: <2026-09-10 Thu>

:PROPERTIES:
:CREATED:  [2026-09-06 Sun]
:END:

Check the [[https://example.com][dashboard]] for *important* numbers.

- first item
- [X] second item done
1. ordered item

# a comment line
`,
  },
  {
    title: "Document metadata",
    description: "#+TITLE and friends, plus emphasis markup",
    code: `#+TITLE: My Project Notes
#+AUTHOR: Ada Lovelace
#+OPTIONS: toc:nil

/italic/, _underline_, =verbatim=, ~code~, and +strikethrough+ all work.
`,
  },
  {
    title: "A source block",
    description: "#+BEGIN_SRC / #+END_SRC and a table",
    code: `#+BEGIN_SRC javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
#+END_SRC

| Name  | Score |
| Alice |    92 |
| Bob   |    88 |
`,
  },
];
