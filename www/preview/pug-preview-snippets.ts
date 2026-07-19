export type PugPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const pugPreviewSnippets: PugPreviewSnippet[] = [
  {
    title: "HTML template",
    description: "tags, id/class shorthand, and attributes",
    code: `doctype html
html(lang="en")
  head
    title My Page
  body
    h1#headline.title Welcome
    nav.menu
      a(href="/") Home
      a(href="/about") About`,
  },
  {
    title: "Mixins and interpolation",
    description: "mixin calls and #{} interpolation",
    code: `mixin card(title)
  .card
    h2.card-title= title
    block

+card("Hello")
  p Posted by #{author} on #{date}`,
  },
  {
    title: "Control flow",
    description: "if/else, each, and case/when as keywords",
    code: `each item in items
  if item.inStock
    p= item.name
  else
    p Out of stock

case item.status
  when "active"
    p Active
  default
    p Unknown`,
  },
  {
    title: "Comments and inline code",
    description: "// buffered comments, and -/=/!= code lines",
    code: `// This renders as an HTML comment
- var year = 2024
p= 'Copyright ' + year
!= renderTrustedHtml()`,
  },
];
