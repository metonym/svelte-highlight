export type HttpfilePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const httpfilePreviewSnippets: HttpfilePreviewSnippet[] = [
  {
    title: "GitHub REST API",
    description: "file variables, a named request, and a JSON body",
    code: `@owner = sveltejs
@repo = svelte
@token = {{$dotenv GITHUB_TOKEN}}

### List open issues
# @name issues
GET https://api.github.com/repos/{{owner}}/{{repo}}/issues
    ?state=open
    &per_page=20
Accept: application/vnd.github+json
Authorization: Bearer {{token}}
X-GitHub-Api-Version: 2022-11-28

### Comment on the first issue
POST https://api.github.com/repos/{{owner}}/{{repo}}/issues/{{issues.response.body.$[0].number}}/comments
Accept: application/vnd.github+json
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "body": "Reproduced on {{$datetime iso8601}}"
}`,
  },
  {
    title: "Log in, then reuse the token",
    description: "JetBrains HTTP Client response handler in JavaScript",
    code: `### Log in
POST {{baseUrl}}/api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}"
}

> {%
  client.test("Login succeeded", function () {
    client.assert(response.status === 200, "Expected 200");
  });
  client.global.set("auth_token", response.body.token);
%}

### Fetch the current user
GET {{baseUrl}}/api/me
Authorization: Bearer {{auth_token}}
Accept: application/json`,
  },
  {
    title: "File upload and saved response",
    description: "multipart body, < input files, and >> output redirects",
    code: `### Upload an avatar
// @no-redirect
POST https://httpbin.org/post
Content-Type: multipart/form-data; boundary=WebAppBoundary

--WebAppBoundary
Content-Disposition: form-data; name="user"

{{$random.uuid}}
--WebAppBoundary
Content-Disposition: form-data; name="avatar"; filename="avatar.png"
Content-Type: image/png

< ./fixtures/avatar.png
--WebAppBoundary--

>> ./responses/upload.json

### Create a pet from a JSON file
PUT https://petstore3.swagger.io/api/v3/pet
Content-Type: application/json

<@ ./fixtures/pet.json`,
  },
];
