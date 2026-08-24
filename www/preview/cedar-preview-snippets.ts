export type CedarPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const cedarPreviewSnippets: CedarPreviewSnippet[] = [
  {
    title: "Permit with when",
    description: "entity UIDs and a when condition",
    code: `permit (
  principal == User::"alice",
  action == Action::"viewPhoto",
  resource
)
when { resource.owner == principal };`,
  },
  {
    title: "Forbid unless MFA",
    description: "unless clause over context",
    code: `forbid (principal, action, resource)
unless { context.mfa == true };`,
  },
  {
    title: "Set membership",
    description: "in and has operators",
    code: `permit (principal, action, resource)
when {
  principal in Group::"admins" &&
  resource has owner
};`,
  },
];
