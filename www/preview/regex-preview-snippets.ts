export type RegexPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const regexPreviewSnippets: RegexPreviewSnippet[] = [
  {
    title: "Named groups and quantifiers",
    description: "a date pattern with named capture groups",
    code: String.raw`^(?<year>\d{4})-(?<month>\d{2})-\d{2}\s+#\s*optional comment`,
  },
  {
    title: "Character classes and Unicode properties",
    description: "POSIX classes, ranges, and \\p{...} escapes",
    code: String.raw`(?:https?|ftp):\/\/[\w.-]+\.[a-z]{2,}
[[:alpha:]]+\d*\.?\p{L}*`,
  },
  {
    title: "Lookaround and backreferences",
    description:
      "lookahead/lookbehind assertions, inline comments, and \\k<name>",
    code: String.raw`(?=foo)(?<=bar)(?!baz)(?<!qux)
(?#inline comment)\k<year>\1`,
  },
];
