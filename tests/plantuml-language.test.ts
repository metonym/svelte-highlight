import { createRegistry } from "../src/engine.js";

import plantuml from "../src/languages/plantuml";

const registry = createRegistry();

registry.register(plantuml.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "plantuml" }).value;

test("plantuml highlights @startuml/@enduml tags as meta", () => {
  const result = highlight("@startuml");

  expect(result).toContain('<span class="hljs-meta">@startuml</span>');
});

test("plantuml highlights declaration keywords", () => {
  const result = highlight('participant "Web Server" as Web');

  expect(result).toContain('<span class="hljs-keyword">participant</span>');
  expect(result).toContain('<span class="hljs-keyword">as</span>');
});

test("plantuml highlights arrows as operators", () => {
  const result = highlight("User -> Web : request page");

  expect(result).toContain('<span class="hljs-operator">-&gt;</span>');
});

test("plantuml highlights stereotypes", () => {
  const result = highlight("class Foo <<interface>>");

  expect(result).toContain(
    '<span class="hljs-type">&lt;&lt;interface&gt;&gt;</span>',
  );
});

test("plantuml highlights colors", () => {
  const result = highlight("note right of Web #lightblue");

  expect(result).toContain('<span class="hljs-number">#lightblue</span>');
});

test("plantuml highlights line comments and state markers", () => {
  const result = highlight("' a comment\n[*] --> State1");

  expect(result).toContain(
    '<span class="hljs-comment">&#x27; a comment</span>',
  );
  expect(result).toContain('<span class="hljs-literal">[*]</span>');
});
