export type JqPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const jqPreviewSnippets: JqPreviewSnippet[] = [
  {
    title: "Filter and transform",
    description: "select active users, then reshape each entry",
    code: `.users
| map(select(.active))
| map({
    id:   .id,
    name: .name,
    tag:  "\\(.role)-\\(.id)"
  })`,
  },
  {
    title: "Reduce and group",
    description: "aggregate order totals per customer",
    code: `.orders
| group_by(.customer)
| map({
    customer: .[0].customer,
    total: reduce .[] as $order (0; . + $order.amount)
  })
| sort_by(-.total)`,
  },
  {
    title: "Errors and format strings",
    description: "try/catch, env access, and @csv output",
    code: `try (
  .records[]
  | select(.score >= 90)
  | [.name, .score, $ENV.REGION]
  | @csv
) catch "error: \\(.)"`,
  },
];
