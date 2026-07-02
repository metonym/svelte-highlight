export type JsonnetPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const jsonnetPreviewSnippets: JsonnetPreviewSnippet[] = [
  {
    title: "Config templating",
    description: "locals, functions, and the std library",
    code: `local name = "frontend";
local replicas = 3;

{
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: {
    name: name,
    labels: { app: name },
  },
  spec: {
    replicas: replicas,
    template: {
      spec: {
        containers: [
          { name: name, image: "registry/" + name + ":latest" },
        ],
      },
    },
  },
}`,
  },
  {
    title: "Functions and comprehensions",
    description: "object construction and std.map",
    code: `local mkPort(p) = { containerPort: p, protocol: "TCP" };

{
  ports: std.map(mkPort, [80, 443, 8080]),
  count: std.length(self.ports),
}`,
  },
  {
    title: "Hidden fields and verbatim strings",
    description: 'field-visibility operators (::, +:) and @"..." escaping',
    code: `local helper = @"a ""quoted"" value";

{
  visible: "shown in output",
  hidden:: "omitted from output",
  computed+: { extra: true },
  note: helper,
}`,
  },
];
