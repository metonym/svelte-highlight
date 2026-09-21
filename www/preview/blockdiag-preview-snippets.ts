export type BlockdiagPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const blockdiagPreviewSnippets: BlockdiagPreviewSnippet[] = [
  {
    title: "Request path",
    description: "edges, labels, and a group",
    code: `blockdiag {
  browser -> web -> db;
  web [label = "API", color = "lightblue"];
  group {
    web; db;
  }
}`,
  },
  {
    title: "HTTP sequence",
    description: "a seqdiag exchange with a database",
    code: `seqdiag {
  browser -> webserver [label = "GET /index"];
  webserver -> database [label = "query"];
  database -> webserver [label = "rows"];
  webserver -> browser [label = "200 OK"];
}`,
  },
  {
    title: "Network and rack",
    description: "an nwdiag subnet and a rack layout",
    code: `nwdiag {
  network dmz {
    address = "192.168.0.0/24"
    web01 [address = "192.168.0.1"];
    web02 [address = "192.168.0.2"];
  }
}

rackdiag {
  16U;
  1: Server;
  2: Switch;
}`,
  },
];
