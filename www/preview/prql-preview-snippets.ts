export type PrqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const prqlPreviewSnippets: PrqlPreviewSnippet[] = [
  {
    title: "Filter and select",
    description: "transform keywords, comparisons, and column lists",
    code: `from employees
filter department == "Sales"
select [name, salary, country]`,
  },
  {
    title: "Derived columns and aggregation",
    description: "derive, group, and aggregate functions",
    code: `from employees
derive [
  gross_salary = salary + payroll_tax,
  gross_cost = gross_salary + benefits_cost,
]
group [title, country] (
  aggregate [
    average salary,
    ct = count this,
  ]
)
sort [-ct]
take 1..20`,
  },
  {
    title: "String interpolation",
    description: "f-strings, s-strings, and date literals",
    code: `from employees
filter start_date > @2020-01-01
derive greeting = f"Hello, {name}!"
derive raw = s"SELECT * FROM employees"`,
  },
];
