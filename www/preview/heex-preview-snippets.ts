export type HeexPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const heexPreviewSnippets: HeexPreviewSnippet[] = [
  {
    title: "User card component",
    description: "function components, slots, and :if/:for special attributes",
    code: `<%!-- user card component --%>
<.card class={@highlighted && "border-blue-500"}>
  <:header>
    <h2>{@user.name}</h2>
  </:header>

  <p :if={@user.bio}>{@user.bio}</p>

  <ul>
    <%= for post <- @posts do %>
      <li>{post.title}</li>
    <% end %>
  </ul>

  <.button phx-click="follow" disabled={@following}>
    Follow
  </.button>
</.card>`,
  },
  {
    title: "EEx output and statement tags",
    description: "<%= %> / <% %> tags with an if/for block",
    code: `<div class="notifications">
  <%= if @unread_count > 0 do %>
    <span class="badge">{@unread_count}</span>
  <% end %>

  <ul>
    <%= for notification <- @notifications do %>
      <li>{notification.message}</li>
    <% end %>
  </ul>
</div>`,
  },
  {
    title: "Attribute interpolation and special attributes",
    description: "{...} attribute values plus :if/:for directives",
    code: `<ul class={["list", @compact && "list--compact"]}>
  <li
    :for={item <- @items}
    :if={item.visible}
    class={item.active && "active"}
  >
    {item.label}
  </li>
</ul>`,
  },
];
