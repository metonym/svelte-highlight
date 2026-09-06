export type SmithyPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const smithyPreviewSnippets: SmithyPreviewSnippet[] = [
  {
    title: "A user shape and service",
    description: "the version control statement, traits, and a doc comment",
    code: `$version: "2"

namespace com.example

/// A simple user shape
@readonly
structure User {
    @required
    id: String

    name: String
}

service UserService {
    version: "2024-01-01"
    resources: [com.example#User]
}
`,
  },
  {
    title: "HTTP traits",
    description: "the http and error traits on an operation",
    code: `@http(method: "GET", uri: "/users/{id}")
operation GetUser {
    input: GetUserInput
    output: GetUserOutput
    errors: [NotFound]
}

@error("client")
structure NotFound {
    message: String
}`,
  },
  {
    title: "Enums and unions",
    description: "an enum shape and a tagged union",
    code: `enum Status {
    ACTIVE
    INACTIVE
}

union SearchResult {
    user: User
    error: NotFound
}`,
  },
];
