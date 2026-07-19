export type TemplPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const templPreviewSnippets: TemplPreviewSnippet[] = [
  {
    title: "Component with control flow",
    description: "Go-flavored control flow and component composition",
    code: `package components

import "fmt"

templ UserCard(name string, isAdmin bool) {
	<div class="card">
		<h2>{ name }</h2>
		if isAdmin {
			<span class="badge">Admin</span>
		}
		<ul>
			for _, role := range roles {
				<li>{ role }</li>
			}
		</ul>
		@Footer()
	</div>
}

templ Footer() {
	<footer>{ fmt.Sprintf("© %d", 2024) }</footer>
}`,
  },
  {
    title: "Script component",
    description: "a legacy script block with a nested if statement",
    code: `script confirmDelete(name string) {
	if (confirm("Delete " + name + "?")) {
		fetch("/delete/" + name, { method: "POST" });
	}
}`,
  },
  {
    title: "CSS component",
    description: "type-safe inline styles with Go expression interpolation",
    code: `css cardStyle(active bool) {
	background-color: { templ.SafeCSSProperty(color) };
	padding: 12px;
	border-radius: 8px;
}`,
  },
];
