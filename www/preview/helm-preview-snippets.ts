export type HelmPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const helmPreviewSnippets: HelmPreviewSnippet[] = [
  {
    title: "ConfigMap template",
    description: "a YAML host with conditional Helm actions",
    code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "app.fullname" . }}
data:
  {{- if .Values.debug }}
  level: debug
  {{- else }}
  level: info
  {{- end }}
  config.yaml: |
    {{ toYaml .Values.settings | nindent 4 }}
`,
  },
  {
    title: "Sprig functions",
    description: "quote, default, and upper",
    code: `name: {{ .Values.name | default "app" | quote }}
env: {{ upper .Values.environment }}`,
  },
  {
    title: "Chart metadata",
    description: "the .Chart and .Release built-in roots",
    code: `labels:
  helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
  app.kubernetes.io/instance: {{ .Release.Name }}`,
  },
];
