export type RobotframeworkPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const robotframeworkPreviewSnippets: RobotframeworkPreviewSnippet[] = [
  {
    title: "Browser login suite",
    description: "settings, variables, test cases, and a user keyword",
    code: `*** Settings ***
Documentation     A test suite for valid login.
...               Keywords live in the resource file.
Library           SeleniumLibrary
Resource          resource.robot
Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser
Test Tags         smoke    login

*** Variables ***
\${SERVER}         localhost:7272
\${BROWSER}        Firefox
\${LOGIN URL}      http://\${SERVER}/
@{VALID USERS}    demo    admin

*** Test Cases ***
Valid Login
    [Documentation]    A valid user lands on the welcome page.
    Input Username    demo
    Input Password    mode
    Submit Credentials
    Welcome Page Should Be Open

Invalid Password
    [Tags]    negative
    Login With Invalid Credentials Should Fail    demo    wrong

*** Keywords ***
Open Browser To Login Page
    Open Browser    \${LOGIN URL}    \${BROWSER}
    Maximize Browser Window
    Title Should Be    Login Page
`,
  },
  {
    title: "Control structures",
    description: "FOR, IF/ELSE IF, TRY/EXCEPT, WHILE, VAR, and RETURN",
    code: `*** Keywords ***
Process Orders
    [Arguments]    @{orders}    &{options}
    VAR    \${total}    \${0}
    FOR    \${index}    \${order}    IN ENUMERATE    @{orders}
        IF    \${order}[status] == 'cancelled'
            CONTINUE
        ELSE IF    \${order}[amount] > 1000
            Log    Large order #\${index}    level=WARN
        END
        \${total}=    Evaluate    \${total} + \${order}[amount]
    END
    TRY
        Submit Total    \${total}    retries=%{RETRIES}
    EXCEPT    ConnectionError*    type=GLOB    AS    \${error}
        Log    Submit failed: \${error}    level=ERROR
    FINALLY
        Disconnect
    END
    WHILE    not \${options}[done]    limit=10
        \${options}[done]=    Poll Status
    END
    RETURN    \${total}
`,
  },
  {
    title: "Data-driven tasks",
    description: "a template with embedded-argument keywords and comments",
    code: `*** Settings ***
Library           Collections
Test Template     Calculate And Verify

*** Test Cases ***    EXPRESSION    EXPECTED
Addition              12 + 2        14
Subtraction           12 - 2        10
Division              12 / 2        6
# Division by zero is covered in errors.robot.

*** Keywords ***
Calculate And Verify
    [Arguments]    \${expression}    \${expected}
    \${result}=    Evaluate    \${expression}
    Should Be Equal As Numbers    \${result}    \${expected}

User "\${name}" Has Role "\${role}"
    \${user}=    Get From Dictionary    \${USERS}    \${name}
    Should Be Equal    \${user}[role]    \${role}

*** Comments ***
Old keywords were removed in the 2.0 rewrite.
`,
  },
];
