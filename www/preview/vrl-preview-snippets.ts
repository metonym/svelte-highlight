export type VrlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const vrlPreviewSnippets: VrlPreviewSnippet[] = [
  {
    title: "Normalize a log event",
    description: "a fallible parse, the coalesce operator, and a conditional",
    code: `# normalize an incoming log event
. = parse_json!(.message)
.status_code = to_int(.status_code) ?? 0
if exists(.error) {
    .level = "error"
} else {
    .level = "info"
}
del(.raw)`,
  },
  {
    title: "String transforms",
    description: "upcase, downcase, and split",
    code: `.host = downcase(.host)
.tags = split(.tag_string, ",")
.name = upcase!(.service_name)`,
  },
  {
    title: "Timestamps and hashing",
    description: "to_timestamp, now, and sha256",
    code: `.received_at = now()
.parsed_at = to_timestamp!(.raw_timestamp)
.fingerprint = sha256(.message)`,
  },
];
