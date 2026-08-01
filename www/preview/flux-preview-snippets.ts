export type FluxPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const fluxPreviewSnippets: FluxPreviewSnippet[] = [
  {
    title: "Filtering a time range",
    description: "pipe-forward operator, built-in functions, and durations",
    code: `from(bucket: "example-bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu" and r._field == "usage_system")
  |> group(columns: ["host"])
  |> mean()
  |> yield(name: "mean")`,
  },
  {
    title: "Windowed aggregation",
    description: "aggregateWindow, keywords, and lambda arrows",
    code: `import "strings"

option task = {name: "cpu-alert", every: 1m}

from(bucket: "telegraf")
  |> range(start: -6h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> filter(fn: (r) => r._value > 80.0)`,
  },
  {
    title: "String interpolation",
    description: "template strings and comments",
    code: `// build a dynamic tag filter
host = "server-01"
query = "host = \${host}"

from(bucket: "example-bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r.host == host)`,
  },
];
