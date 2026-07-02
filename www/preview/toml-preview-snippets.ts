export type TomlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const tomlPreviewSnippets: TomlPreviewSnippet[] = [
  {
    title: "Package manifest",
    description: "tables, strings, and arrays",
    code: `# project metadata
[package]
name = "svelte-highlight"
version = "1.0.0"
authors = ["Jane Doe <jane@example.com>"]
keywords = ["syntax", "highlight"]`,
  },
  {
    title: "Numbers and dates",
    description: "hex/octal/binary, floats, and RFC 3339 dates",
    code: `[build]
threads = 8
ratio = 0.75
mask = 0xDEAD_BEEF
permissions = 0o755
flags = 0b1010
released = 2024-01-02T10:30:00Z`,
  },
  {
    title: "Nested tables and inline tables",
    description: "array-of-tables and dotted keys",
    code: `[server]
host = "localhost"
port = 8080

[database]
connection = { user = "admin", timeout = 30 }
ssl.enabled = true

[[server.endpoints]]
path = "/api"
methods = ["GET", "POST"]`,
  },
  {
    title: "Quoted keys",
    description: "keys that need quoting: dots, spaces, and IPs",
    code: `[servers]
"127.0.0.1" = "localhost"
"key with spaces" = true

[servers."router.local"]
enabled = true`,
  },
];
