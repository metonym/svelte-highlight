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
];
