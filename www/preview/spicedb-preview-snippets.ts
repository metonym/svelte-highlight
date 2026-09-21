export type SpicedbPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const spicedbPreviewSnippets: SpicedbPreviewSnippet[] = [
  {
    title: "A document sharing schema",
    description: "viewers and editors, with editors implying view access",
    code: `definition user {}

definition document {
  relation viewer: user | user:*
  relation editor: user

  permission view = viewer + editor
  permission edit = editor
}
`,
  },
  {
    title: "An organization with inherited folder permissions",
    description: "a permission computed through a parent relation with ->",
    code: `definition user {}

definition organization {
  relation admin: user
  relation member: user
}

definition folder {
  relation org: organization
  relation viewer: user

  permission view = viewer + org->admin
}
`,
  },
  {
    title: "A caveated relationship",
    description:
      "a caveat expression that must evaluate true for the relationship to hold",
    code: `definition user {}

definition resource {
  relation viewer: user
  permission view = viewer
}

caveat has_valid_ip(user_ip ipaddress) {
  user_ip.in_cidr("192.168.0.0/16")
}

caveat during_business_hours(current_time timestamp) {
  current_time.getHours() >= 9 && current_time.getHours() < 17
}
`,
  },
];
