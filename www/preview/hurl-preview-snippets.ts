export type HurlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const hurlPreviewSnippets: HurlPreviewSnippet[] = [
  {
    title: "GET with asserts",
    description: "status line, jsonpath, and header predicates",
    code: `# list users
GET https://example.org/api/users
HTTP 200
[Asserts]
jsonpath "$.id" == 1
header "Content-Type" contains "json"`,
  },
  {
    title: "POST with headers",
    description: "request headers section and created status",
    code: `POST https://example.org/api/users
[Headers]
Content-Type: application/json
HTTP 201`,
  },
  {
    title: "Captures",
    description: "comments and captured jsonpath values",
    code: `# capture the created id
POST https://example.org/api/users
HTTP 201
[Captures]
id: jsonpath "$.id"`,
  },
];
