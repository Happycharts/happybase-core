export const defaultValue = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: {
        level: 1,
      },
      content: [
        {
          type: "text",
          text: "Collaborative SQL Project",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Welcome to our collaborative SQL and data warehouse management project. Use this document to share queries, discuss schema changes, and coordinate our data strategy.",
        },
      ],
    },
    {
      type: "heading",
      attrs: {
        level: 2,
      },
      content: [
        {
          type: "text",
          text: "Current Tasks",
        },
      ],
    },
    {
      type: "bulletList",
      attrs: {
        tight: true,
      },
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Optimize query performance for sales dashboard",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Design new schema for customer analytics",
                },
              ],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Implement data quality checks",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: {
        level: 2,
      },
      content: [
        {
          type: "text",
          text: "Sample Query",
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: {
        language: "sql",
      },
      content: [
        {
          type: "text",
          text: "SELECT customer_id, SUM(order_total) as total_revenue\nFROM orders\nWHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)\nGROUP BY customer_id\nORDER BY total_revenue DESC\nLIMIT 10;",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This query retrieves the top 10 customers by revenue over the past year. We might want to optimize this for larger datasets.",
        },
      ],
    },
  ],
};