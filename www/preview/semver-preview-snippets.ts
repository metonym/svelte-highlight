export type SemverPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const semverPreviewSnippets: SemverPreviewSnippet[] = [
  {
    title: "A release version",
    code: "1.4.2",
  },
  {
    title: "Prerelease and build metadata",
    description: "a version with both a prerelease tag and build metadata",
    code: "2.1.0-alpha.1+exp.sha.5114f85",
  },
  {
    title: "A package.json dependency range",
    description: "caret, tilde, and comparator ranges",
    code: `{
  "highlight": "^11.12.0",
  "svelte": "~5.0.0",
  "typescript": ">=5.0.0 <6.0.0",
  "vite": "1.0.0 - 2.9.9"
}`,
  },
];
