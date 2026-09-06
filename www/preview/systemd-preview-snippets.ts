export type SystemdPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const systemdPreviewSnippets: SystemdPreviewSnippet[] = [
  {
    title: "A basic service unit",
    description: "Unit, Service, and Install sections",
    code: `[Unit]
Description=Example web service
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=www-data
Environment=PORT=%p
ExecStartPre=-/usr/bin/mkdir -p /run/example
ExecStart=/usr/bin/example-server --port=\${PORT}
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
`,
  },
  {
    title: "A timer unit",
    description: "OnCalendar scheduling and Persistent",
    code: `[Unit]
Description=Run backup every day

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
`,
  },
  {
    title: "Sandboxing options",
    description: "hardening keys and literal on/off values",
    code: `[Service]
ExecStart=/usr/bin/example-daemon
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
NoNewPrivileges=true
DynamicUser=yes
StandardOutput=journal
StandardError=journal
`,
  },
];
