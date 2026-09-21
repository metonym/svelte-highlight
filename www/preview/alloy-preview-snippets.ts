export type AlloyPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const alloyPreviewSnippets: AlloyPreviewSnippet[] = [
  {
    title: "Address book model",
    description:
      "The classic Alloy tutorial example: a sig hierarchy, a fact invariant, and a pred",
    code: `module addressBook

sig Name, Addr {}

sig Book {
  addr: Name -> lone Addr
}

pred add [b, b': Book, n: Name, a: Addr] {
  b'.addr = b.addr + n -> a
}

pred del [b, b': Book, n: Name] {
  b'.addr = b.addr - n -> Addr
}

fact NoSelfLoop {
  no n: Name | n in n.(addr.Book)
}

assert AddIdempotent {
  all b, b', b'': Book, n: Name, a: Addr |
    add[b, b', n, a] and add[b', b'', n, a] implies b'.addr = b''.addr
}

check AddIdempotent for 3`,
  },
  {
    title: "File system invariant",
    description: "abstract sig with extends, and a fact enforcing tree shape",
    code: `abstract sig FSObject {}

sig File extends FSObject {}

sig Dir extends FSObject {
  contents: set FSObject
}

one sig Root extends Dir {}

fact NoCycles {
  all d: Dir | d not in d.^contents
}

fact OneParent {
  all o: FSObject - Root | one d: Dir | o in d.contents
}

pred reachable [o: FSObject] {
  o in Root.*contents
}

run reachable for 5`,
  },
  {
    title: "Ring leader election",
    description: "disj/lone quantifiers and a check with a scope",
    code: `sig Process {
  succ: lone Process,
  id: one Int
}

fact Ring {
  all p: Process | Process in p.^succ
}

pred distinctIds {
  all disj p1, p2: Process | p1.id != p2.id
}

pred isLeader [p: Process] {
  all q: Process - p | p.id.gt[q.id]
}

assert OneLeader {
  distinctIds implies (lone p: Process | isLeader[p])
}

check OneLeader for 6 Process`,
  },
];
