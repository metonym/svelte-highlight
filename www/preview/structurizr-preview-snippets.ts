export type StructurizrPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const structurizrPreviewSnippets: StructurizrPreviewSnippet[] = [
  {
    title: "A basic workspace",
    description: "model, relationships, and a system context view",
    code: `workspace "Big Bank" {
  !identifiers hierarchical

  model {
    customer = person "Customer"
    softwareSystem = softwareSystem "Internet Banking" {
      webapp = container "Web Application"
    }

    customer -> softwareSystem.webapp "Uses" "HTTPS"
  }

  views {
    systemContext softwareSystem {
      include *
      autoLayout lr
    }
  }
}
`,
  },
  {
    title: "Deployment nodes",
    description: "deploymentEnvironment, deploymentNode, and infrastructure",
    code: `model {
  deploymentEnvironment "Production" {
    deploymentNode "AWS" {
      deploymentNode "EC2" {
        containerInstance webapp
      }
      infrastructureNode "Load Balancer"
    }
  }
}
`,
  },
  {
    title: "Styles and theming",
    description: "the styles block and element styling properties",
    code: `views {
  styles {
    element "Software System" {
      background #1168bd
      color #ffffff
      shape roundedBox
    }
    relationship "Relationship" {
      color #707070
      dashed false
      thickness 2
    }
  }
}
`,
  },
];
