export type SnortPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const snortPreviewSnippets: SnortPreviewSnippet[] = [
  {
    title: "Suspicious HTTP request",
    description: "an alert action, variables, and rule options",
    code: `# detect suspicious HTTP requests
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (
    msg:"Suspicious User-Agent";
    content:"User-Agent|3A|"; http_header;
    content:"evilbot"; distance:0; nocase;
    pcre:"/evil[0-9]+/i";
    classtype:trojan-activity;
    sid:1000001; rev:1;
)
`,
  },
  {
    title: "DNS tunneling detection",
    description: "protocol matching and content options",
    code: `alert udp $HOME_NET any -> any 53 (
    msg:"Possible DNS tunneling";
    content:"|00 01 00 00 00 00 00 00|";
    dsize:>512;
    sid:1000002; rev:1;
)`,
  },
  {
    title: "Drop rule",
    description: "the drop action and a byte_test option",
    code: `drop tcp any any -> $HOME_NET any (
    msg:"Blocked payload";
    byte_test:4,>,1000,0;
    sid:1000003; rev:1;
)`,
  },
];
