export type LogqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const logqlPreviewSnippets: LogqlPreviewSnippet[] = [
  {
    title: "Log stream filter",
    description: "stream selector and pipeline line filters",
    code: `{job="app", env=~"prod|staging"}
  |= "error"
  != "timeout"`,
  },
  {
    title: "Error rate",
    description: "range aggregation over a filtered log stream",
    code: `sum by (job) (
  rate({job="app"} |= "error" [5m])
)`,
  },
  {
    title: "Compound duration",
    description: "a [1h30m]-style range combining two number+unit segments",
    code: `max_over_time(
  {job="app"} | json | unwrap duration [1h30m]
) by (route)`,
  },
  {
    title: "Parsed request duration",
    description: "parser stage, unwrap, and quantile aggregation",
    code: `quantile_over_time(0.99,
  {job="app"} | json | unwrap duration [5m]
) by (route)`,
  },
];
