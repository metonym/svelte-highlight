const SYSTEMD_SECTIONS = [
  "Unit",
  "Service",
  "Install",
  "Socket",
  "Timer",
  "Mount",
  "Path",
  "Slice",
  "Match",
  "Network",
  "Address",
  "Route",
  "DHCP",
  "NetDev",
];

const SYSTEMD_KNOWN_KEYS = [
  "Description",
  "After",
  "Before",
  "Requires",
  "Wants",
  "BindsTo",
  "Conflicts",
  "PartOf",
  "ConditionPathExists",
  "Type",
  "ExecStart",
  "ExecStartPre",
  "ExecStartPost",
  "ExecStop",
  "ExecReload",
  "Restart",
  "RestartSec",
  "User",
  "Group",
  "WorkingDirectory",
  "Environment",
  "EnvironmentFile",
  "KillMode",
  "TimeoutStartSec",
  "TimeoutStopSec",
  "WantedBy",
  "RequiredBy",
  "Alias",
  "OnCalendar",
  "OnBootSec",
  "OnUnitActiveSec",
  "Persistent",
  "ListenStream",
  "Accept",
  "What",
  "Where",
  "Options",
  "PrivateTmp",
  "ProtectSystem",
  "ProtectHome",
  "NoNewPrivileges",
  "CapabilityBoundingSet",
  "AmbientCapabilities",
  "LimitNOFILE",
  "MemoryMax",
  "CPUQuota",
  "StandardOutput",
  "StandardError",
  "SyslogIdentifier",
  "Nice",
  "OOMScoreAdjust",
  "DynamicUser",
  "StateDirectory",
  "RuntimeDirectory",
];

const SYSTEMD_LITERALS =
  "yes no true false on off simple forking oneshot notify dbus idle exec always on-failure on-abnormal multi-user.target network-online.target full strict read-only journal inherit null tty";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineSystemd(hljs) {
  const SECTION = {
    className: "section",
    begin: new RegExp(`^\\[(?:${SYSTEMD_SECTIONS.join("|")})\\]`),
    relevance: 10,
  };

  const SPECIFIER = {
    className: "template-variable",
    begin: /%[inNphtuUHmbv%]/,
    relevance: 0,
  };

  const VARIABLE = {
    className: "variable",
    variants: [
      { begin: /\$\{[A-Za-z_][A-Za-z0-9_]*\}/ },
      { begin: /\$[A-Za-z_][A-Za-z0-9_]*/ },
    ],
    relevance: 0,
  };

  const EXEC_PREFIX = {
    className: "operator",
    begin: /[-@+!]+(?=\/)/,
    relevance: 0,
  };

  const KNOWN_KEY = {
    className: "built_in",
    begin: new RegExp(`^(?:${SYSTEMD_KNOWN_KEYS.join("|")})(?=\\s*=)`),
    relevance: 5,
  };

  const KEY = {
    className: "attr",
    begin: /^[A-Za-z][A-Za-z0-9]*(?=\s*=)/,
    relevance: 0,
  };

  return {
    name: "systemd",
    aliases: ["unit", "service"],
    case_insensitive: false,
    keywords: {
      literal: SYSTEMD_LITERALS,
    },
    contains: [
      hljs.COMMENT("#", "$"),
      hljs.COMMENT(";", "$"),
      SECTION,
      KNOWN_KEY,
      KEY,
      EXEC_PREFIX,
      SPECIFIER,
      VARIABLE,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSystemd(hljs);
}

export const systemd = { name: "systemd", register };
export default systemd;
