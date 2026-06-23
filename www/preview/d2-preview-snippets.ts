export type D2PreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const d2PreviewSnippets: D2PreviewSnippet[] = [
  {
    title: "System diagram",
    description: "shapes, connections, and labels",
    code: `# request flow
client -> server: HTTP request
server -> db: query

server.shape: rectangle
db.shape: cylinder
client.shape: person`,
  },
  {
    title: "Containers and styles",
    description: "nested objects and style attributes",
    code: `network: {
  web -> api: REST
  api -> cache: read

  cache.shape: cylinder
  api.style.fill: "#f5f5f5"
}

network.web -> network.api: internal`,
  },
];
