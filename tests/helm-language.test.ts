import { createRegistry, registerAll } from "../src/engine.js";

import helm from "../src/languages/helm";

const registry = createRegistry();

registerAll(registry, helm);

const highlight = (code: string) =>
  registry.highlight(code, { language: "helm" }).value;

test("helm highlights the surrounding yaml", () => {
  const result = highlight("apiVersion: v1\nkind: ConfigMap");

  expect(result).toContain('<span class="hljs-attr">apiVersion:</span>');
});

test("helm highlights sprig/helm built-ins inside an action", () => {
  const result = highlight('{{ include "app.fullname" . }}');

  expect(result).toContain('<span class="hljs-built_in">include</span>');
});

test("helm highlights the .Values root as a built-in", () => {
  const result = highlight("{{ toYaml .Values.settings | nindent 4 }}");

  expect(result).toContain(
    '<span class="hljs-built_in">.Values.settings</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">toYaml</span>');
});

test("helm highlights trim-marker actions and control flow keywords", () => {
  const result = highlight("{{- if .Values.debug }}\nlevel: debug\n{{- end }}");

  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">end</span>');
});
