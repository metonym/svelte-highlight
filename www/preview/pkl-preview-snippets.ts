export type PklPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const pklPreviewSnippets: PklPreviewSnippet[] = [
  {
    title: "Application config",
    description: "properties, types, and string interpolation",
    code: `name = "svelte-highlight"
version = "8.0.0"

server {
  host = "0.0.0.0"
  port = 8080
  url = "http://\\(host):\\(port)"
}

environments = new Listing {
  "development"
  "staging"
  "production"
}`,
  },
  {
    title: "Classes and functions",
    description: "class declarations and typed functions",
    code: `class Endpoint {
  path: String
  method: String = "GET"
}

function route(path: String): Endpoint = new Endpoint {
  path = path
}

routes {
  ["health"] = route("/health")
  ["users"] = route("/api/users")
}`,
  },
  {
    title: "Interpolation with nested calls",
    description: "a \\(...) interpolation containing its own function call",
    code: `local tags = List("core", "docs", "themes")

summary = "tags: \\(tags.join(", "))"`,
  },
  {
    title: "Triple-quoted pound strings and annotations",
    description: 'a #"""..."""# string and a dotted @annotation',
    code: `@modulepath.Deprecated { message = "use v2 instead" }
class LegacyConfig {
  template = #"""
    Use \\#(name) with caution.
    Braces like {this} are literal here.
    """#
}`,
  },
];
