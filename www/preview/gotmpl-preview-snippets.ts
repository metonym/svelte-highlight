export type GotmplPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const gotmplPreviewSnippets: GotmplPreviewSnippet[] = [
  {
    title: "Greeting template",
    description: "a define block, a conditional, and a range loop",
    code: `{{- /* render a greeting */ -}}
{{ define "greeting" }}
Hello, {{ .Name | printf "%s" }}!
{{ if .Admin }}
  You are an admin, {{ $name := .Name }}{{ $name }}.
{{ else }}
  {{ range .Items }}
    - {{ . }}
  {{ end }}
{{ end }}
{{ end }}`,
  },
  {
    title: "Comparisons and built-ins",
    description: "eq, len, and the pipe operator",
    code: `{{ if eq .Status "active" }}
  {{ len .Items }} items
{{ end }}
{{ .Description | html }}`,
  },
  {
    title: "Blocks and templates",
    description: "block and template actions",
    code: `{{ block "content" . }}
  default content
{{ end }}
{{ template "footer" . }}`,
  },
];
