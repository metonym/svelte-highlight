/** A realistic TypeScript file for the CodeToolbar demos. */
export const sample = `import { readFile } from "node:fs/promises";

export interface Config {
  name: string;
  port: number;
  routes: Record<string, string>;
}

const DEFAULTS: Config = {
  name: "app",
  port: 3000,
  routes: {},
};

/**
 * Loads a JSON config file and fills in missing fields with defaults.
 */
export async function loadConfig(path: string): Promise<Config> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as Partial<Config>;

  if (parsed.port !== undefined && !Number.isInteger(parsed.port)) {
    throw new TypeError(\`Invalid port in \${path}: \${parsed.port}\`);
  }

  return {
    ...DEFAULTS,
    ...parsed,
    routes: { ...DEFAULTS.routes, ...parsed.routes },
  };
}

export function routeFor(config: Config, name: string): string | undefined {
  return config.routes[name];
}
`;
