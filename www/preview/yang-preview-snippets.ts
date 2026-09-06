export type YangPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const yangPreviewSnippets: YangPreviewSnippet[] = [
  {
    title: "A system module",
    description: "leaf-list, a prefixed type, and an augment statement",
    code: `module example-system {
  namespace "urn:example:system";
  prefix sys;

  import ietf-inet-types {
    prefix inet;
  }

  leaf-list address {
    type inet:ip-address;
    description
      "A list of addresses.";
  }

  container system {
    leaf host-name {
      type string;
      default "localhost";
    }

    augment "/system/config" {
      leaf enabled {
        type boolean;
        default true;
      }
    }
  }
}
`,
  },
  {
    title: "Typedefs and identities",
    description: "a custom type and an identity hierarchy",
    code: `typedef percent {
  type uint8 {
    range "0..100";
  }
}

identity ethernet {
  base interface-type;
}`,
  },
  {
    title: "RPCs and notifications",
    description: "an rpc definition with input and output",
    code: `rpc reboot {
  input {
    leaf delay {
      type uint32;
      default 0;
    }
  }
  output {
    leaf success {
      type boolean;
    }
  }
}`,
  },
];
