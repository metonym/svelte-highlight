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
    title: "Multiple addresses on one site block",
    description: "one site header covering several hostnames",
    code: `www.example.com example.com {
	redir https://example.com{uri} permanent
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
  {
    title: "Load-balanced upstream with TLS options",
    description: "to, lb_policy, health_uri, protocols, and ciphers",
    code: `api.example.com {
	reverse_proxy {
		to backend1:8080 backend2:8080
		lb_policy round_robin
		health_uri /health
	}
	tls {
		protocols tls1.2 tls1.3
		ciphers TLS_AES_256_GCM_SHA384
	}
}`,
  },
];
