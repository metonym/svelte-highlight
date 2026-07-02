export type CuePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const cuePreviewSnippets: CuePreviewSnippet[] = [
  {
    title: "Schema and constraints",
    description: "definitions, types, and field constraints",
    code: `package config

#Server: {
	host:    string
	port:    int & >0 & <65536
	tls:     bool | *false
	timeout: string | *"30s"
}

production: #Server & {
	host: "example.com"
	port: 443
	tls:  true
}`,
  },
  {
    title: "Comprehensions",
    description: "for expressions and string interpolation",
    code: `names: ["app", "api", "web"]

services: {
	for name in names {
		"\\(name)": {
			image: "registry/\\(name):latest"
		}
	}
}`,
  },
  {
    title: "Byte strings and optional fields",
    description: "'...' byte strings and the ? optional marker",
    code: `#Config: {
	secret?: string
	salt:    bytes | 'default-salt'
}`,
  },
];
