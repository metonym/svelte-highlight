export type SveltePreviewTheme = {
  name: string;
  moduleName: string;
};

export const sveltePreviewThemes: SveltePreviewTheme[] = [
  { name: "horizon-dark", moduleName: "horizonDark" },
  { name: "atom-one-dark", moduleName: "atomOneDark" },
  { name: "github-dark", moduleName: "githubDark" },
  { name: "dracula", moduleName: "dracula" },
  { name: "nord", moduleName: "nord" },
  { name: "github", moduleName: "github" },
];
