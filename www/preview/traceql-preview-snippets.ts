export type TraceqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const traceqlPreviewSnippets: TraceqlPreviewSnippet[] = [
  {
    title: "Error spanset",
    description: "resource attributes and status literals",
    code: `{ resource.service.name = "api" && status = error }`,
  },
  {
    title: "Structural pipeline",
    description: "child spanset >> and count()",
    code: `{ span.http.status_code >= 500 } >> { name = "SQL SELECT" } | count()`,
  },
  {
    title: "Duration filter",
    description: "comments and duration literals",
    code: `# slow traces
{ duration > 5s }`,
  },
];
