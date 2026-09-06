export type VclPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const vclPreviewSnippets: VclPreviewSnippet[] = [
  {
    title: "A basic VCL config",
    description: "the vcl header, a backend, and vcl_recv/vcl_backend_response",
    code: `vcl 4.1;

import std;

backend default {
    .host = "127.0.0.1";
    .port = "8080";
}

sub vcl_recv {
    if (req.method == "PURGE") {
        return (purge);
    }
    set req.http.X-Forwarded-For = client.ip;
}

sub vcl_backend_response {
    set beresp.ttl = 1h;
}
`,
  },
  {
    title: "ACLs and caching rules",
    description: "an acl block and cache control logic",
    code: `acl purge_allowed {
    "localhost";
    "192.168.0.0"/24;
}

sub vcl_deliver {
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }
}`,
  },
  {
    title: "Synthetic responses",
    description: "vcl_synth and the synthetic function",
    code: `sub vcl_synth {
    if (resp.status == 750) {
        set resp.status = 301;
        set resp.http.Location = req.http.X-Redirect-To;
        return (deliver);
    }
    synthetic("Error " + resp.status);
}`,
  },
];
