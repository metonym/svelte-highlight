const CISCO_KEYWORDS = [
  "interface",
  "ip",
  "ipv6",
  "router",
  "hostname",
  "version",
  "service",
  "enable",
  "username",
  "line",
  "access-list",
  "vlan",
  "switchport",
  "description",
  "shutdown",
  "no",
  "exit",
  "end",
  "banner",
  "crypto",
  "logging",
  "ntp",
  "snmp-server",
  "spanning-tree",
  "route-map",
  "neighbor",
  "network",
  "address",
  "permit",
  "deny",
  "match",
  "set",
  "class-map",
  "policy-map",
  "aaa",
  "boot",
  "clock",
  "domain",
  "name-server",
  "default-gateway",
  "route",
  "ospf",
  "bgp",
  "eigrp",
  "rip",
  "vrf",
  "mtu",
  "speed",
  "duplex",
  "encapsulation",
  "dot1q",
  "trunk",
  "access",
  "mode",
  "channel-group",
  "standby",
  "tunnel",
  "nat",
  "inside",
  "outside",
  "overload",
  "standard",
  "extended",
  "remark",
  "login",
  "password",
  "secret",
  "transport",
  "input",
  "ssh",
  "telnet",
  "console",
  "vty",
];

const CISCO_BUILT_INS = "any host eq gt lt range log";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCisco(hljs) {
  const COMMENT = {
    className: "comment",
    begin: /^!/,
    end: /$/,
    relevance: 5,
  };

  const INTERFACE_NAME = {
    className: "title.class",
    begin:
      /\b(?:GigabitEthernet|FastEthernet|TenGigabitEthernet|Ethernet|Loopback|Vlan|Port-channel|Serial|Tunnel|Dialer)\S*/,
    relevance: 5,
  };

  const IP_ADDRESS = {
    className: "number",
    begin: /\b[0-9a-fA-F]*:[0-9a-fA-F:]+\b|\b\d{1,3}(?:\.\d{1,3}){3}\b/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
  };

  return {
    name: "Cisco IOS",
    aliases: ["ios", "cisco-ios"],
    case_insensitive: true,
    keywords: {
      keyword: CISCO_KEYWORDS,
      built_in: CISCO_BUILT_INS,
    },
    contains: [COMMENT, INTERFACE_NAME, IP_ADDRESS, STRING, hljs.C_NUMBER_MODE],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCisco(hljs);
}

export const cisco = { name: "cisco", register };
export default cisco;
