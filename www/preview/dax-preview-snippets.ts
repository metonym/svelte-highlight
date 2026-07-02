export type DaxPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const daxPreviewSnippets: DaxPreviewSnippet[] = [
  {
    title: "Filtered sales measure",
    description: "CALCULATE with FILTER and column references",
    code: `Western Sales =
CALCULATE(
    SUM('Sales'[Amount]),
    FILTER(ALL('Sales'), 'Sales'[Region] = "West")
)`,
  },
  {
    title: "Year-over-year growth",
    description: "VAR/RETURN, DIVIDE, and time intelligence",
    code: `YoY Growth % =
VAR CurrentSales = SUM('Sales'[Amount])
VAR PriorSales =
    CALCULATE(
        SUM('Sales'[Amount]),
        SAMEPERIODLASTYEAR('Calendar'[Date])
    )
RETURN
    DIVIDE(CurrentSales - PriorSales, PriorSales, BLANK())`,
  },
  {
    title: "Ranked items",
    description: "RANKX, comments, and column references",
    code: `// Rank each item by total sales within its category
Item Rank =
RANKX(
    ALLEXCEPT('Inventory', 'Inventory'[Category]),
    [Total Sales]
) -- higher amount = better rank`,
  },
];
