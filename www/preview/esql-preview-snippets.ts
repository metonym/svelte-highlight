export type EsqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const esqlPreviewSnippets: EsqlPreviewSnippet[] = [
  {
    title: "Error rate by host",
    description: "FROM/WHERE/STATS pipeline with COUNT",
    code: `FROM logs-*
| WHERE status >= 500
| STATS count = COUNT(*) BY host
| SORT count DESC
| LIMIT 10`,
  },
  {
    title: "EVAL and KEEP",
    description: "computed columns and field pruning",
    code: `FROM metrics
| EVAL ratio = bytes_out / bytes_in
| KEEP host, ratio
| WHERE ratio > 2`,
  },
  {
    title: "GROK parse",
    description: "comments and string patterns",
    code: `// extract request path
FROM logs
| GROK message "%{WORD:method} %{URIPATH:path}"
| STATS hits = COUNT(*) BY path`,
  },
];
