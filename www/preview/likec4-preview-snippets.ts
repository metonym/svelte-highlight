export type Likec4PreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const likec4PreviewSnippets: Likec4PreviewSnippet[] = [
  {
    title: "Specification and model",
    description: "element kinds, nested components, and a relationship",
    code: `specification {
  element actor {
    style {
      shape person
    }
  }
  element system
  element component
  relationship async
}

model {
  customer = actor 'Customer'
  cloud = system 'Our SaaS' {
    ui = component 'Frontend'
    api = component 'Backend'
    ui -> api 'requests' async
  }
  customer -> ui 'opens in browser'
}`,
  },
  {
    title: "Extend a system",
    description: "a second file adding nested elements to cloud",
    code: `// cloud/service.c4
model {
  extend cloud {
    service1 = service 'Billing'
    service1 -> api 'charges' #async
  }
}`,
  },
  {
    title: "Landscape view",
    description: "include everything except one component",
    code: `views {
  view index {
    title 'Landscape'
    include *
    exclude cloud.api
  }

  view of cloud {
    include *
    style customer {
      color green
    }
  }
}`,
  },
];
