export type DotenvPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const dotenvPreviewSnippets: DotenvPreviewSnippet[] = [
  {
    title: "Application config",
    description: "comments, keys, and values",
    code: `# application environment
NODE_ENV=production
PORT=8080
DEBUG=false
APP_NAME=svelte-highlight`,
  },
  {
    title: "Quoting and interpolation",
    description: "quoted values and variable references",
    code: `HOST=localhost
PORT=5432
DATABASE_URL="postgres://\${HOST}:\${PORT}/app"
GREETING='literal $not-expanded value'
PATH_EXTRA="\${HOME}/bin"`,
  },
  {
    title: "Exported variables",
    description: "export prefix and secrets",
    code: `export AWS_REGION=us-east-1
export API_TOKEN="sk_live_0123456789"
# feature flags
ENABLE_CACHE=true
MAX_RETRIES=3`,
  },
];
