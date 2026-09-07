export type HoconPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const hoconPreviewSnippets: HoconPreviewSnippet[] = [
  {
    title: "A basic config",
    description: "dotted keys, durations, sizes, and substitutions",
    code: `# server configuration
app {
  name = "my-service"
  port = 8080
  timeout = 30s
  max-size = 512k

  db.url = \${?DATABASE_URL}
  db.retries += 1

  include required(classpath("defaults.conf"))
}
`,
  },
  {
    title: "Includes",
    description: "the include forms and literal values",
    code: `include "base.conf"
include file("local.conf")
include url("https://example.com/shared.conf")

feature-flags {
  dark-mode = on
  beta-access = off
  telemetry = yes
}
`,
  },
  {
    title: "Arrays and triple-quoted strings",
    description: "array values and a multi-line string literal",
    code: `servers = ["a.example.com", "b.example.com"]

description = """
This is a multi-line
HOCON string value.
"""
`,
  },
];
