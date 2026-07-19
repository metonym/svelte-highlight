export type RegoPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const regoPreviewSnippets: RegoPreviewSnippet[] = [
  {
    title: "HTTP API authorization",
    description: "allow rules referencing input.method and input.path",
    code: `package authz

import future.keywords.if

default allow := false

allow if {
	input.method == "GET"
	startswith(input.path, "/public")
}

allow if {
	input.method == "POST"
	input.path == "/login"
}

allow if {
	some role in input.user.roles
	role == "admin"
}`,
  },
  {
    title: "Kubernetes admission control",
    description: "deny rules for pod security policy",
    code: `package kubernetes.admission

import future.keywords.if
import future.keywords.in
import future.keywords.contains

deny contains msg if {
	some container in input.request.object.spec.containers
	container.image == ""
	msg := sprintf("container %v has no image", [container.name])
}

deny contains msg if {
	not input.request.object.spec.securityContext.runAsNonRoot
	msg := "pods must not run as root"
}

deny contains msg if {
	input.request.kind.kind == "Pod"
	count(input.request.object.spec.containers) == 0
	msg := "pod must define at least one container"
}`,
  },
  {
    title: "Function-style rule heads",
    description: "helper functions with (params), not just partial sets",
    code: `package authz

is_valid_user(u) {
	u.age >= 18
	u.status == "active"
}

allow if {
	is_valid_user(input.user)
	count(input.user.roles) > 0
}`,
  },
  {
    title: "Data references and built-ins",
    description: "object, string, and aggregate built-in functions",
    code: `package rbac

user_roles[user] := roles if {
	some user
	roles := {role |
		some binding in data.role_bindings
		binding.user == user
		role := binding.role
	}
}

allowed_actions := object.get(data.permissions, input.role, [])

is_owner if {
	input.resource.owner == input.user.id
}

# require at least one matching permission
authorized if {
	count(allowed_actions) > 0
	input.action in allowed_actions
}`,
  },
];
