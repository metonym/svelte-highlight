export type HclPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const hclPreviewSnippets: HclPreviewSnippet[] = [
  {
    title: "Resource block",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: interpolation
    description: 'resource blocks and "${...}" interpolation',
    code: `# Web server
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = "t3.micro"
  count         = 2

  tags = {
    Name = "web-\${count.index}"
    Env  = var.environment
  }
}`,
  },
  {
    title: "Terraform settings",
    description: "terraform, variable, output, and locals blocks",
    code: `terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "environment" {
  type    = string
  default = "dev"
}

locals {
  is_prod = var.environment == "prod"
}

output "instance_ids" {
  value = aws_instance.web[*].id
}`,
  },
  {
    title: "Heredoc and dynamic blocks",
    description: "<<- heredoc and dynamic ingress",
    code: `resource "aws_iam_policy" "this" {
  name = "example"

  policy = <<-EOT
    {
      "Version": "2012-10-17",
      "Statement": []
    }
  EOT
}

resource "aws_security_group" "this" {
  dynamic "ingress" {
    for_each = var.ports
    content {
      from_port = ingress.value
      to_port   = ingress.value
      protocol  = "tcp"
    }
  }
}`,
  },
];
