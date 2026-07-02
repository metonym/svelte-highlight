export type RazorPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const razorPreviewSnippets: RazorPreviewSnippet[] = [
  {
    title: "Razor page",
    description: "directives, expressions, and markup",
    code: `@page "/products"
@model ProductsModel

<h1>@Model.Title</h1>

<ul>
    @foreach (var product in Model.Products)
    {
        <li>@product.Name — @product.Price</li>
    }
</ul>`,
  },
  {
    title: "Code blocks and comments",
    description: "@{ } blocks and @* *@ comments",
    code: `@* product summary section *@
@{
    var total = Model.Items.Count;
    var label = total == 1 ? "item" : "items";
}

<p>You have @total @label in your cart.</p>
<a href="/checkout">Checkout</a>`,
  },
  {
    title: "Nested code blocks",
    description: "@code with nested braces, @(), and interpolated strings",
    code: `@code {
    private int total = 0;

    private void Increment()
    {
        if (total < 10)
        {
            total += 1;
        }
    }
}

<p>Total: @(total * 2)</p>
<p>@($"Current value is {total}")</p>`,
  },
];
