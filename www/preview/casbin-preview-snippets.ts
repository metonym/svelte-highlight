export type CasbinPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const casbinPreviewSnippets: CasbinPreviewSnippet[] = [
  {
    title: "A basic RBAC model",
    description: "roles inherited through g(), matched against the request",
    code: `[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
`,
  },
  {
    title: "An ABAC model with RESTful path matching",
    description: "keyMatch2 resolves path parameters like /alice/:resource",
    code: `[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = r.sub == p.sub && keyMatch2(r.obj, p.obj) && r.act == p.act
`,
  },
  {
    title: "A domain-aware RBAC model",
    description: "roles scoped per tenant with a three-argument g()",
    code: `[request_definition]
r = sub, obj, act, dom

[policy_definition]
p = sub, obj, act, dom

[role_definition]
g = _, _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub, r.dom) && r.obj == p.obj && r.act == p.act && r.dom == p.dom
`,
  },
];
