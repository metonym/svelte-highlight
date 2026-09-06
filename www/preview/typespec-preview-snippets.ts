export type TypeSpecPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const typespecPreviewSnippets: TypeSpecPreviewSnippet[] = [
  {
    title: "A user model and route",
    description: "decorators, a model, and an HTTP interface",
    code: `import "@typespec/http";
using TypeSpec.Http;

@doc("A simple user model")
model User {
  @key
  id: string;

  name: string;
  age?: int32;
}

@route("/users")
interface Users {
  @get op list(): User[];
}
`,
  },
  {
    title: "Validation decorators",
    description: "minLength, maxLength, and pattern",
    code: `model Username {
  @minLength(3)
  @maxLength(20)
  @pattern("^[a-z0-9_]+$")
  value: string;
}`,
  },
  {
    title: "Enums and unions",
    description: "an enum and a union of string literals",
    code: `enum Status {
  Active,
  Inactive,
}

union Role {
  "admin",
  "member",
}`,
  },
];
