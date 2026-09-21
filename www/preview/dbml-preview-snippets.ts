export type DbmlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const dbmlPreviewSnippets: DbmlPreviewSnippet[] = [
  {
    title: "Blog schema",
    description: "tables, an enum, and a relationship",
    code: `Table users {
  id integer [primary key]
  username varchar [not null, unique]
  role varchar
  created_at timestamp
}

Table posts {
  id integer [primary key]
  title varchar
  body text [note: 'Content of the post']
  user_id integer [not null]
  status post_status
  created_at timestamp
}

Enum post_status {
  draft
  published
  private [note: 'visible to creator']
}

Ref: posts.user_id > users.id`,
  },
  {
    title: "Orders and payments",
    description: "inline refs, indexes, and many-to-many",
    code: `Table customers {
  id integer [pk, increment]
  email varchar [unique, not null]
}

Table orders {
  id integer [pk, increment]
  customer_id integer [ref: > customers.id]
  status order_status
  placed_at timestamp [default: \`now()\`]

  indexes {
    (customer_id, placed_at) [name: 'customer_orders']
  }
}

Enum order_status {
  pending
  paid
  shipped
  cancelled
}

Table products {
  id integer [pk]
  sku varchar [unique]
  price decimal
}

Table order_items {
  order_id integer [ref: > orders.id]
  product_id integer [ref: > products.id]
  quantity integer [not null]

  indexes {
    (order_id, product_id) [pk]
  }
}`,
  },
  {
    title: "Project and table group",
    description: "database settings wrapping a group of tables",
    code: `Project ecommerce {
  database_type: 'PostgreSQL'
  Note: 'Checkout schema'
}

TableGroup checkout {
  customers
  orders
  order_items
}`,
  },
];
