export type CiscoPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const ciscoPreviewSnippets: CiscoPreviewSnippet[] = [
  {
    title: "Interface configuration",
    description: "an interface block, an ACL, and OSPF routing",
    code: `! configure the uplink interface
interface GigabitEthernet0/0/1
 description Uplink to core
 ip address 192.168.1.1 255.255.255.0
 no shutdown
!
access-list 101 permit tcp any host 10.0.0.5 eq 443
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
`,
  },
  {
    title: "VLAN and trunking",
    description: "vlan, switchport, and trunk configuration",
    code: `vlan 10
 name Engineering

interface GigabitEthernet0/0/2
 switchport mode trunk
 switchport trunk encapsulation dot1q
 switchport trunk allowed vlan 10,20,30`,
  },
  {
    title: "Line and access control",
    description: "vty line configuration with SSH transport",
    code: `line vty 0 4
 login local
 transport input ssh
!
username admin secret cisco123`,
  },
];
