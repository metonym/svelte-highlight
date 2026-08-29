export type JsonataPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const jsonataPreviewSnippets: JsonataPreviewSnippet[] = [
  {
    title: "Path navigation and aggregation",
    description: "dotted field access, predicates, and a built-in function",
    code: `/* total price of active orders */
$sum(
  Account.Order[Status = "active"].Product.(Price * Quantity)
)

Account.\`Order Item\`[0].Description`,
  },
  {
    title: "Object construction",
    description: "an object constructor built from built-in functions",
    code: `Account.Order.{
  "OrderID": OrderID,
  "Total": $sum(Product.(Price * Quantity)),
  "ItemCount": $count(Product)
}`,
  },
  {
    title: "Higher-order functions",
    description: "$map, $filter, and a lambda function literal",
    code: `$filter(
  $map(Account.Order, function($o) { $o.Total }),
  function($t) { $t > 100 }
)`,
  },
];
