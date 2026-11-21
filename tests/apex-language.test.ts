import { createRegistry } from "../src/engine.js";

import apex from "../src/languages/apex";

const registry = createRegistry();

registry.register(apex.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "apex" }).value;

test("apex highlights sharing modifiers and class names", () => {
  const result = highlight("public without sharing class AccountService {}");

  expect(result).toContain('<span class="hljs-keyword">without sharing</span>');
  expect(result).toContain('<span class="hljs-keyword">class</span>');
  expect(result).toContain(
    '<span class="hljs-title class_">AccountService</span>',
  );
});

test("apex keywords are case-insensitive", () => {
  const result = highlight("PUBLIC Inherited Sharing CLASS Foo {}");

  expect(result).toContain('<span class="hljs-keyword">PUBLIC</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">Inherited Sharing</span>',
  );
  expect(result).toContain('<span class="hljs-title class_">Foo</span>');
});

test("apex highlights SOQL keywords and bind variables inside brackets", () => {
  const result = highlight(
    "List<Account> accs = [SELECT Id FROM Account WHERE Id IN :ids LIMIT 5];",
  );

  expect(result).toContain('<span class="hljs-type">List</span>');
  expect(result).toContain('<span class="hljs-keyword">SELECT</span>');
  expect(result).toContain('<span class="hljs-keyword">FROM</span>');
  expect(result).toContain('<span class="hljs-keyword">WHERE</span>');
  expect(result).toContain('<span class="hljs-variable">:ids</span>');
  expect(result).toContain('<span class="hljs-number">5</span>');
});

test("apex leaves array indexing brackets alone", () => {
  const result = highlight("Account first = accounts[0];");

  expect(result).not.toContain("hljs-keyword");
  expect(result).toContain('<span class="hljs-number">0</span>');
});

test("apex highlights trigger declarations and events", () => {
  const result = highlight(
    "trigger AccountTrigger on Account (before insert, after update) {}",
  );

  expect(result).toContain('<span class="hljs-keyword">trigger</span>');
  expect(result).toContain(
    '<span class="hljs-title class_">AccountTrigger</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">on</span>');
  expect(result).toContain('<span class="hljs-type">Account</span>');
  expect(result).toContain('<span class="hljs-keyword">before insert</span>');
  expect(result).toContain('<span class="hljs-keyword">after update</span>');
});

test("apex highlights DML statements but not member names", () => {
  const result = highlight("upsert records;\nDatabase.insert(records, false);");

  expect(result).toContain('<span class="hljs-keyword">upsert</span>');
  expect(result).toContain('<span class="hljs-built_in">Database</span>');
  expect(result).not.toContain('<span class="hljs-keyword">insert</span>');
});

test("apex styles platform members like before", () => {
  const result = highlight(
    "for (Account a : Trigger.new) { System.debug(a); }\nTest.startTest();",
  );

  expect(result).toContain('<span class="hljs-built_in">Trigger</span>.new');
  expect(result).toContain('<span class="hljs-built_in">System</span>.debug');
  expect(result).toContain('<span class="hljs-built_in">Test</span>.startTest');
});

test("apex scores Salesforce-only constructs for auto-detection", () => {
  const relevance = (code: string) =>
    registry.highlight(code, { language: "apex" }).relevance;

  // Each construct is worth more than a run of shared Java keywords.
  expect(relevance("@AuraEnabled")).toBeGreaterThanOrEqual(10);
  expect(relevance("System.debug(x);")).toBeGreaterThanOrEqual(10);
  expect(relevance("for (Account a : Trigger.new) {}")).toBeGreaterThanOrEqual(
    10,
  );
  expect(relevance("update accounts;")).toBeGreaterThanOrEqual(5);
  // A plain member call or a JavaScript `delete` gets nothing.
  expect(relevance("System.out.println(x);")).toBeLessThan(5);
  expect(relevance("delete obj.key;")).toBeLessThan(5);
});

test("apex highlights annotations, strings and comments", () => {
  const result = highlight(
    "@IsTest\n// setup\nstatic void run() { String s = 'ok'; }",
  );

  expect(result).toContain('<span class="hljs-meta">@IsTest</span>');
  expect(result).toContain('<span class="hljs-comment">// setup</span>');
  expect(result).toContain('<span class="hljs-string">&#x27;ok&#x27;</span>');
});
