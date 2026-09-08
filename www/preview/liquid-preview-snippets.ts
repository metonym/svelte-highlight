export type LiquidPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const liquidPreviewSnippets: LiquidPreviewSnippet[] = [
  {
    title: "Product card",
    description: "a comment, output tags, and a filter",
    code: `{% comment %}Renders a product card{% endcomment %}
<div class="card">
  <h1>{{ product.title | upcase }}</h1>
  {% if product.available %}
    <p>{{ product.price }}</p>
  {% else %}
    <p>Sold out</p>
  {% endif %}
</div>`,
  },
  {
    title: "Loop with assignment",
    description: "for/endfor, assign, and increment",
    code: `{% assign featured = collection.products | first %}
<ul>
  {% for item in collection.products %}
    <li>{{ item.title }}</li>
  {% endfor %}
</ul>`,
  },
  {
    title: "Include with variables",
    description: "render/include tags passing local variables",
    code: `{% render 'price', product: product, on_sale: true %}
{{ product.description | strip_html | truncate: 100 }}`,
  },
];
