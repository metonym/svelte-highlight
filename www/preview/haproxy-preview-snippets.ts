export type HaproxyPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const haproxyPreviewSnippets: HaproxyPreviewSnippet[] = [
  {
    title: "A basic HAProxy config",
    description: "global/defaults sections, a frontend, and a backend",
    code: `global
    log stdout format raw local0
    maxconn 4096

defaults
    mode http
    timeout connect 5s
    timeout client 30s
    timeout server 30s

frontend web
    bind *:80
    acl is_api path_beg /api
    use_backend api_servers if is_api
    default_backend web_servers

backend web_servers
    balance roundrobin
    server web1 10.0.0.1:8080 check
`,
  },
  {
    title: "TLS termination and server checks",
    description: "ssl bind options and health-check server attributes",
    code: `frontend https_in
    bind *:443 ssl crt /etc/haproxy/certs/site.pem
    default_backend app_servers

backend app_servers
    option httpchk GET /healthz
    server app1 10.0.1.10:8080 check inter 2s rise 2 fall 3 weight 10
    server app2 10.0.1.11:8080 check backup
`,
  },
  {
    title: "Logging and sample fetches",
    description: "log-format variables and ACL fetches on request headers",
    code: `frontend web
    log-format %ci:%cp\\ [%tr]\\ %ft\\ %b/%s
    acl has_referer hdr(referer) -m found
    http-request set-header X-Client-IP %[src]
    use_backend static_servers if { path_end .css .js .png }
`,
  },
];
