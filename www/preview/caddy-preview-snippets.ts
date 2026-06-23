export type CaddyPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const caddyPreviewSnippets: CaddyPreviewSnippet[] = [
  {
    title: "Reverse proxy site",
    description: "site addresses, directives, and placeholders",
    code: `example.com {
	encode gzip
	reverse_proxy localhost:8080 {
		header_up X-Real-IP {remote_host}
	}
	log {
		output file /var/log/caddy/access.log
	}
}`,
  },
  {
    title: "Matchers and static files",
    description: "named matchers, snippets, and file serving",
    code: `# shared TLS config
(tls_config) {
	tls admin@example.com
}

static.example.com {
	import tls_config
	root * /srv/www
	@assets path /static/*
	handle @assets {
		file_server
	}
}`,
  },
];
