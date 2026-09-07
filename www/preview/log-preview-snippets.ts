export type LogPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const logPreviewSnippets: LogPreviewSnippet[] = [
  {
    title: "A basic application log",
    description: "ISO timestamps, levels, tags, and a stack trace",
    code: `2026-09-06T10:00:00.123Z INFO  [main] Starting server on 127.0.0.1:8080
2026-09-06T10:00:01.456Z WARN  [req-123] slow query id=42 duration=1200
2026-09-06T10:00:02.789Z ERROR [worker-1] Exception: NullPointerException
    at com.foo.Bar.process(Bar.java:10)
2026-09-06T10:00:03.012Z DEBUG [main] pid[4821] GET /api/users 200
`,
  },
  {
    title: "Syslog and Apache formats",
    description: "syslog-style and Apache combined log timestamps",
    code: `Sep  6 10:00:00 web1 sshd[1234]: Accepted publickey for admin
[06/Sep/2026:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 512
`,
  },
  {
    title: "Structured key=value logs",
    description: "key=value pairs and a UUID request id",
    code: `level=info msg="request completed" method=POST path=/api/orders status=201 duration_ms=42 request_id=550e8400-e29b-41d4-a716-446655440000
`,
  },
];
