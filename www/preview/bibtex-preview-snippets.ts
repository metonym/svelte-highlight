export type BibtexPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bibtexPreviewSnippets: BibtexPreviewSnippet[] = [
  {
    title: "Article entry",
    description: "entry types, fields, and braced values",
    code: `@article{shannon1948,
  author  = {Claude E. Shannon},
  title   = {A Mathematical Theory of Communication},
  journal = {Bell System Technical Journal},
  year    = 1948,
  volume  = 27,
  pages   = {379--423},
}`,
  },
  {
    title: "Book and proceedings",
    description: "multiple entries and quoted values",
    code: `@book{knuth1997,
  author    = {Donald E. Knuth},
  title     = "The Art of Computer Programming",
  publisher = {Addison-Wesley},
  year      = 1997,
}

@inproceedings{vaswani2017,
  author = {Vaswani, Ashish and others},
  title  = {Attention Is All You Need},
  year   = 2017,
}`,
  },
];
