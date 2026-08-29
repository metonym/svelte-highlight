export type SplunkPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const splunkPreviewSnippets: SplunkPreviewSnippet[] = [
  {
    title: "A stats pipeline",
    description: "search terms, the pipe operator, and stats by",
    code: `search index=web status>=500
| stats count by host
| eval error_rate = count / total
| where error_rate > 0.05 AND host != "test"
| sort - count`,
  },
  {
    title: "Field extraction with rex",
    description: "rex, table, and boolean search terms",
    code: `search sourcetype=access_combined
| rex field=_raw "user=(?<user>\\w+)"
| table host, user, status
| dedup user`,
  },
  {
    title: "Eval functions",
    description: "coalesce, if, and string functions",
    code: `eval label = if(isnull(coalesce(name, alias)), "unknown", upper(name))`,
  },
];
