export type JmespathPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const jmespathPreviewSnippets: JmespathPreviewSnippet[] = [
  {
    title: "Filter and project",
    description: "a filter expression, a multi-select hash, and a pipe",
    code: "people[?age > \`30\`].{name: name, city: address.city} | sort_by(@, &name)",
  },
  {
    title: "String literals and quoted identifiers",
    description: "a raw string, a backtick JSON literal, and a quoted field",
    code: `people[?"first name" == 'Ada'] | length(@)`,
  },
  {
    title: "Built-in functions",
    description: "sort_by, max_by, and to_array",
    code: "max_by(reservations[].instances[], &launch_time) | to_array(@)",
  },
];
