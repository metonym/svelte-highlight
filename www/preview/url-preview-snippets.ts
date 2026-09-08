export type UrlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const urlPreviewSnippets: UrlPreviewSnippet[] = [
  {
    title: "REST API endpoint",
    description: "a query string with multiple parameters",
    code: "https://api.example.com/v1/search?q=highlight+js&limit=20&sort=relevance",
  },
  {
    title: "A mailto link",
    code: "mailto:jane.doe@example.com",
  },
  {
    title: "Userinfo, port, and fragment",
    description: "an authenticated URL with a non-default port and an anchor",
    code: "https://user:pass@internal.example.com:8443/docs/setup#installation",
  },
];
