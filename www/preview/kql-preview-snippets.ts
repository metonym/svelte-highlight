export type KqlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const kqlPreviewSnippets: KqlPreviewSnippet[] = [
  {
    title: "Failed sign-ins over time",
    description: "tabular operators, functions, and timespans",
    code: `SigninLogs
| where TimeGenerated > ago(1d)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
| order by FailedCount desc
| take 10`,
  },
  {
    title: "Security event investigation",
    description: "string operators, let statements, and rendering",
    code: `let threshold = 5;
SecurityEvent
| where EventID == 4624
| where Account !contains "SYSTEM"
| summarize LogonCount = count() by Account, Computer
| where LogonCount > threshold
| render columnchart`,
  },
  {
    title: "Join hints",
    description: "hint.strategy and hint.shufflekey on a join",
    code: `SigninLogs
| join hint.strategy=broadcast (
    IdentityInfo | project AccountUPN, Department
) on $left.UserPrincipalName == $right.AccountUPN
| join hint.shufflekey=UserPrincipalName kind=leftouter (
    AuditLogs | summarize LastAudit = max(TimeGenerated) by UserPrincipalName
) on UserPrincipalName`,
  },
  {
    title: "Parsing and reshaping logs",
    description: "mv-expand, parse, and string functions",
    code: `Event
| where Source has "MSSQLSERVER" // inline comment
| mv-expand Tags
| parse EventData with "user=" User " action=" Action
| extend Summary = strcat(User, " performed ", Action)
| project TimeGenerated, Summary`,
  },
];
