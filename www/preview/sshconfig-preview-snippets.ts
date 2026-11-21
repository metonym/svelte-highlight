export type SshconfigPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const sshconfigPreviewSnippets: SshconfigPreviewSnippet[] = [
  {
    title: "Personal ~/.ssh/config",
    description: "per-host keys and a catch-all block at the end",
    code: `# Load drop-in files first
Include ~/.ssh/config.d/*

Host github.com gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

Host home-nas
    HostName 192.168.1.20
    Port 2222
    User admin

Host *
    AddKeysToAgent yes
    UseKeychain yes
    ServerAliveInterval 60
    ServerAliveCountMax 3`,
  },
  {
    title: "Jump host and connection sharing",
    description: "reach private hosts through a bastion and reuse sockets",
    code: `Host bastion
  HostName bastion.example.com
  User ops
  ForwardAgent no

Host *.internal !legacy.internal
  ProxyJump bastion
  StrictHostKeyChecking accept-new
  ControlMaster auto
  ControlPath ~/.ssh/cm-%r@%h:%p
  ControlPersist 10m

Host legacy.internal
  ProxyCommand ssh -W %h:%p bastion
  HostKeyAlgorithms +ssh-rsa
  PubkeyAcceptedAlgorithms +ssh-rsa`,
  },
  {
    title: "Match blocks",
    description: "settings that apply only when the conditions hold",
    code: `Match host *.corp.example.com exec "test -f \${HOME}/.vpn-up"
  User jdoe
  IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"

Match originalhost db-* user deploy
  LocalForward 5432 localhost:5432
  ExitOnForwardFailure yes

Match all
  SendEnv LANG LC_*`,
  },
  {
    title: "Hardened sshd_config",
    description: "server settings that disable passwords and root login",
    code: `Port 22
AddressFamily inet
ListenAddress 0.0.0.0

PermitRootLogin prohibit-password
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

ClientAliveInterval 300
MaxAuthTries 3

Subsystem sftp internal-sftp

Match Group sftp-only
    ChrootDirectory /srv/sftp/%u
    ForceCommand internal-sftp
    AllowTcpForwarding no
    X11Forwarding no`,
  },
];
