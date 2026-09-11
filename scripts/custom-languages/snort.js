// Rule actions (Snort 2, Snort 3's `block`/`rewrite`/`react`, Suricata's
// `rejectsrc`/`rejectdst`/`rejectboth`). They are matched only at the start
// of a line: as plain keywords, `drop` fired inside
// `metadata:policy balanced-ips drop` and `log` inside `alerts.log`.
const SNORT_ACTIONS =
  "alert log pass drop reject sdrop block rewrite react activate dynamic " +
  "rejectsrc rejectdst rejectboth";

// Rules-file directives, also line-anchored.
const SNORT_DIRECTIVES = "var ipvar portvar include";

const SNORT_PROTOCOLS =
  "tcp udp icmp ip http tls dns ssh smb ftp smtp any " +
  // Snort 3 `alert file` and the service names both engines accept in the
  // rule header.
  "file ssl http2 sip dcerpc dhcp nfs ntp snmp mqtt tftp imap pop3 krb5";

const SNORT_OPTION_KEYS = [
  "msg",
  "content",
  "pcre",
  "sid",
  "rev",
  "classtype",
  "flow",
  "nocase",
  "depth",
  "offset",
  "distance",
  "within",
  "fast_pattern",
  "http_uri",
  "http\\.uri",
  "http\\.method",
  "dsize",
  "flags",
  "flowbits",
  "reference",
  "metadata",
  "priority",
  "threshold",
  "detection_filter",
  "byte_test",
  "byte_jump",
  "isdataat",
  "urilen",
  "tag",
  "gid",
  "target",
  // Snort 3 options and sticky buffers.
  "rawbytes",
  "relative",
  "noalert",
  "service",
  "enable",
  "rem",
  "regex",
  "replace",
  "ttl",
  "tos",
  "id",
  "ipopts",
  "fragbits",
  "fragoffset",
  "ip_proto",
  "itype",
  "icode",
  "icmp_id",
  "icmp_seq",
  "seq",
  "ack",
  "window",
  "stream_size",
  "stream_reassemble",
  "byte_extract",
  "byte_math",
  "bufferlen",
  "base64_decode",
  "base64_data",
  "file_data",
  "file_type",
  "file_meta",
  "pkt_data",
  "raw_data",
  "js_data",
  "vba_data",
  "md5",
  "sha256",
  "sha512",
  "asn1",
  "ber_data",
  "ber_skip",
  "cvs",
  "dce_iface",
  "dce_opnum",
  "dce_stub_data",
  "dnp3_data",
  "dnp3_func",
  "dnp3_ind",
  "dnp3_obj",
  "modbus_data",
  "modbus_func",
  "modbus_unit",
  "gtp_info",
  "gtp_type",
  "gtp_version",
  "sip_method",
  "sip_header",
  "sip_body",
  "sip_stat_code",
  "ssl_state",
  "ssl_version",
  "sd_pattern",
  "so",
  "soid",
  "rpc",
  "http_client_body",
  "http_cookie",
  "http_header",
  "http_method",
  "http_param",
  "http_raw_body",
  "http_raw_cookie",
  "http_raw_header",
  "http_raw_request",
  "http_raw_status",
  "http_raw_trailer",
  "http_raw_uri",
  "http_stat_code",
  "http_stat_msg",
  "http_trailer",
  "http_true_ip",
  "http_version",
  "http_version_match",
  // Suricata sticky buffers and keywords.
  "http\\.host",
  "http\\.header",
  "http\\.user_agent",
  "http\\.cookie",
  "http\\.request_body",
  "http\\.response_body",
  "http\\.stat_code",
  "http\\.content_type",
  "tls\\.sni",
  "tls\\.cert_subject",
  "tls\\.cert_issuer",
  "dns\\.query",
  "ja3\\.hash",
  "ja3s\\.hash",
  "tcp\\.flags",
  "startswith",
  "endswith",
  "bsize",
  "xbits",
  "flowint",
  "iprep",
  "dataset",
  "datarep",
  "lua",
  "geoip",
  "filestore",
  "filemagic",
  "fileext",
  "filename",
  "filesize",
  "filemd5",
  "filesha1",
  "filesha256",
  "app-layer-event",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSnort(hljs) {
  const HEX_BYTES = {
    className: "number",
    begin: /\|[0-9a-fA-F\s]*\|/,
  };

  const CONTENT_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [HEX_BYTES],
  };

  const PCRE_STRING = {
    className: "regexp",
    begin: /pcre\s*:\s*"/,
    end: /"/,
    relevance: 5,
  };

  // An option is `name:value;`, a bare option or sticky buffer (`http_uri;`,
  // `nocase,`), or a Snort 3 content modifier with a space-separated value
  // (`offset 0, depth 32`).
  const OPTION_KEY = {
    className: "attr",
    begin: new RegExp(
      `\\b(?:${SNORT_OPTION_KEYS.join("|")})(?=\\s*[:;,]|\\s+-?\\d)`,
    ),
    relevance: 0,
  };

  const ACTION = {
    begin: [
      /^[ \t]*/,
      new RegExp(`(?:${SNORT_ACTIONS.split(" ").join("|")})\\b`),
    ],
    beginScope: { 2: "keyword" },
    relevance: 5,
  };

  const DIRECTIVE = {
    begin: [
      /^[ \t]*/,
      new RegExp(`(?:${SNORT_DIRECTIVES.split(" ").join("|")})\\b`),
    ],
    beginScope: { 2: "keyword" },
    relevance: 0,
  };

  const VARIABLE = {
    className: "variable",
    begin: /\$[A-Z_][A-Z0-9_]*/,
    relevance: 0,
  };

  const DIRECTION = {
    className: "operator",
    begin: /->|<>/,
    relevance: 0,
  };

  const CIDR = {
    className: "number",
    begin: /\b\d{1,3}(?:\.\d{1,3}){3}(?:\/\d+)?\b/,
    relevance: 0,
  };

  return {
    name: "Snort",
    aliases: ["suricata"],
    keywords: {
      type: SNORT_PROTOCOLS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      ACTION,
      DIRECTIVE,
      PCRE_STRING,
      CONTENT_STRING,
      OPTION_KEY,
      VARIABLE,
      DIRECTION,
      CIDR,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSnort(hljs);
}

export const snort = { name: "snort", register };
export default snort;
