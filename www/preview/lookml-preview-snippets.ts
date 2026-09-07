export type LookmlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const lookmlPreviewSnippets: LookmlPreviewSnippet[] = [
  {
    title: "A basic view",
    description: "block headers, dimensions, measures, and sql values",
    code: `view: orders {
  sql_table_name: schema.orders ;;

  dimension: id {
    primary_key: yes
    type: number
    sql: \${TABLE}.id ;;
  }

  measure: total_orders {
    type: count
    drill_fields: [id]
  }
}
`,
  },
  {
    title: "An explore with a join",
    description: "explore, join, and relationship literals",
    code: `explore: orders {
  join: customers {
    type: left_outer
    relationship: many_to_one
    sql_on: \${orders.customer_id} = \${customers.id} ;;
  }
}
`,
  },
  {
    title: "Liquid templating",
    description: "{% parameter %} and {{ value }} inside a sql field",
    code: `dimension: region_filtered {
  sql:
    {% if region._parameter_value == 'All' %}
      \${TABLE}.region
    {% else %}
      '{{ region._parameter_value }}'
    {% endif %}
  ;;
}
`,
  },
];
