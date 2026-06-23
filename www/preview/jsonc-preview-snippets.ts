export type JsoncPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const jsoncPreviewSnippets: JsoncPreviewSnippet[] = [
  {
    title: "tsconfig.json",
    description: "JSON with // and /* */ comments",
    code: `{
  // TypeScript compiler options
  "compilerOptions": {
    "target": "ESNext",
    "strict": true,
    /* module resolution */
    "moduleResolution": "bundler",
    "skipLibCheck": true
  },
  "include": ["src"]
}`,
  },
  {
    title: "VS Code settings",
    description: "comments alongside standard JSON values",
    code: `{
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  // disable telemetry
  "telemetry.telemetryLevel": "off",
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": false
  }
}`,
  },
  {
    title: "Numbers, strings, and literals",
    description: "standard JSON value types",
    code: `{
  "name": "svelte-highlight",
  "version": "1.0.0",
  "count": 42,
  "ratio": 0.75,
  "enabled": true,
  "disabled": false,
  "empty": null
}`,
  },
];
