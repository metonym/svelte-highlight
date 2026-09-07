export type MarkdocPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const markdocPreviewSnippets: MarkdocPreviewSnippet[] = [
  {
    title: "A basic document",
    description: "frontmatter, a comment tag, and a callout tag",
    code: `---
title: Getting Started
---

# Welcome

{% comment %} internal note, not rendered {% /comment %}

{% callout type="warning" %}
Set the $name variable before calling {% if(equals($name, "")) %}validate(){% /if %}.
{% /callout %}

{% partial file="footer.md" /%}
`,
  },
  {
    title: "Functions and variables",
    description: "and(), or(), not(), default() over Markdoc variables",
    code: `{% if(and(equals($status, "active"), not($archived))) %}
This item is active and not archived.
{% /if %}

{% $user.name %} joined on {% default($joinDate, "unknown") %}.
`,
  },
  {
    title: "Table and shorthand attributes",
    description: "the {% table %} tag with #id and .class shorthands",
    code: `{% table %}
* Name
* Score
---
* Alice
* 92
* Bob
* 88
{% /table %}

{% callout #important .highlight %}
This section needs review.
{% /callout %}
`,
  },
];
