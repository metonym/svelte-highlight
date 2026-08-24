export type KdlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const kdlPreviewSnippets: KdlPreviewSnippet[] = [
  {
    title: "Package manifest",
    description: "nodes, nested children, and strings",
    code: `package {
  name "svelte-highlight"
  version 1.0
  authors "Ada" "Grace"
}`,
  },
  {
    title: "Properties and literals",
    description: "key=value properties and hash literals",
    code: `server host="localhost" port=8080 enabled=#true {
  tls cert="cert.pem"
}`,
  },
  {
    title: "Comments and type annotations",
    description: "line comments, slashdash, and (type) values",
    code: `// app config
/- skipped 1
created (date)"2024-01-01"
timeout (u32)30`,
  },
];
