import { createRegistry } from "../src/engine.js";

import robotframework from "../src/languages/robotframework";

const registry = createRegistry();
registry.register(robotframework.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "robotframework" }).value;

test("robotframework registers the robot alias", () => {
  const code = "*** Settings ***\nLibrary    Collections";

  expect(registry.get("robot")).toBeDefined();
  expect(registry.highlight(code, { language: "robot" }).value).toBe(
    highlight(code),
  );
});

test("robotframework highlights section headers in any case", () => {
  const result = highlight(
    "*** Settings ***\nLibrary    OperatingSystem\n\n*** test cases ***\nSmoke\n    Log    hi",
  );

  expect(result).toContain(
    '<span class="hljs-section">*** Settings ***</span>',
  );
  expect(result).toContain(
    '<span class="hljs-section">*** test cases ***</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">Library</span>');
});

test("robotframework highlights all four variable kinds", () => {
  const result = highlight(
    "*** Test Cases ***\nVars\n    Log Many    ${scalar}    @{list}    &{dict}    %{HOME}",
  );

  expect(result).toContain('<span class="hljs-variable">${scalar}</span>');
  expect(result).toContain('<span class="hljs-variable">@{list}</span>');
  expect(result).toContain('<span class="hljs-variable">&amp;{dict}</span>');
  expect(result).toContain('<span class="hljs-variable">%{HOME}</span>');
});

test("robotframework highlights test names, settings, and keyword calls", () => {
  const result = highlight(
    "*** Test Cases ***\nValid Login\n    [Documentation]    Logs in.\n    [Tags]    smoke\n    Open Browser    about:blank",
  );

  expect(result).toContain(
    '<span class="hljs-title function_">Valid Login</span>',
  );
  expect(result).toContain('<span class="hljs-meta">[Documentation]</span>');
  expect(result).toContain('<span class="hljs-meta">[Tags]</span>');
  expect(result).toContain(
    '<span class="hljs-title function_ invoke__">Open Browser</span>',
  );
});

test("robotframework highlights uppercase control structures only", () => {
  const result = highlight(
    "*** Keywords ***\nLoop\n    FOR    ${i}    IN RANGE    3\n        TRY\n            Log    ${i}\n        EXCEPT    *\n            BREAK\n        END\n    END\n    VAR    ${x}    1\n    RETURN    ${x}",
  );

  for (const word of [
    "FOR",
    "TRY",
    "EXCEPT",
    "BREAK",
    "END",
    "VAR",
    "RETURN",
  ]) {
    expect(result).toContain(`<span class="hljs-keyword">${word}</span>`);
  }
  expect(highlight("*** Keywords ***\nX\n    Log    for")).not.toContain(
    '<span class="hljs-keyword">for</span>',
  );
});

test("robotframework treats # as a comment only at a cell start", () => {
  const result = highlight(
    "*** Test Cases ***\n# whole line\nT\n    Log    issue #42    # trailing",
  );

  expect(result).toContain('<span class="hljs-comment"># whole line</span>');
  expect(result).toContain('<span class="hljs-comment"># trailing</span>');
  expect(result).toContain("issue #42");
  expect(result).not.toContain('<span class="hljs-comment">#42');
});

test("robotframework keeps embedded arguments in keyword names", () => {
  const result = highlight(
    "*** Keywords ***\nUser ${name} Logs In\n    No Operation",
  );

  expect(result).toContain(
    '<span class="hljs-title function_">User <span class="hljs-variable">${name}</span> Logs In</span>',
  );
});

test("robotframework highlights the keyword after an assignment", () => {
  const result = highlight(
    "*** Test Cases ***    INPUT    EXPECTED\nT\n    ${user}=    Get From Dictionary    ${USERS}    alice",
  );

  expect(result).toContain(
    '<span class="hljs-section">*** Test Cases ***</span>    INPUT',
  );
  expect(result).toContain('<span class="hljs-variable">${user}</span>=');
  expect(result).toContain(
    '<span class="hljs-title function_ invoke__">Get From Dictionary</span>',
  );
});

test("robotframework scores control steps and list variables", () => {
  const relevance = (code: string) =>
    registry.highlight(code, { language: "robotframework" }).relevance;
  const header = "*** Keywords ***\nDo It\n";
  const base = relevance(header);

  expect(relevance(`${header}    FOR    \${x}    IN    a\n    END`)).toBe(
    base + 10,
  );
  expect(relevance(`${header}    Log Many    @{items}`)).toBe(base + 5);
  expect(relevance(`${header}    Log    \${x}`)).toBe(base);
  // Control words outside a steps section score nothing.
  expect(relevance("    FOR    x\n    END")).toBe(0);
});
