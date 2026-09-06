export type EjsPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const ejsPreviewSnippets: EjsPreviewSnippet[] = [
  {
    title: "User list",
    description: "a loop tag, an output tag, and a comment tag",
    code: `<%# render a list of users %>
<ul>
  <% users.forEach(function(user) { %>
    <li><%= user.name %></li>
  <% }); %>
</ul>
<p><%- rawHtml %></p>`,
  },
  {
    title: "Conditional rendering",
    description: "scriptlet tags controlling which markup renders",
    code: `<% if (loggedIn) { %>
  <p>Welcome back, <%= username %>!</p>
<% } else { %>
  <p><a href="/login">Log in</a></p>
<% } %>`,
  },
  {
    title: "Whitespace control",
    description: "the trim-mode <%_ and -%> tags",
    code: `<ul>
  <%_ items.forEach(function(item) { -%>
  <li><%= item.label %></li>
  <%_ }); -%>
</ul>`,
  },
];
