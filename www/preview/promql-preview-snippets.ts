export type PromqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const promqlPreviewSnippets: PromqlPreviewSnippet[] = [
  {
    title: "Request rate",
    description: "functions, label matchers, and durations",
    code: `sum by (job) (
  rate(http_requests_total{status="200", env="prod"}[5m])
)`,
  },
  {
    title: "Latency and alerts",
    description: "aggregation and comparison operators",
    code: `histogram_quantile(
  0.95,
  sum by (le) (rate(request_duration_seconds_bucket[5m]))
)
> 0.5`,
  },
  {
    title: "Bare metrics and the @ modifier",
    description: "metric names without {}, and the @ timestamp modifier",
    code: `up offset 5m

node_cpu_seconds_total @ 1609746000

up @ start()`,
  },
];
