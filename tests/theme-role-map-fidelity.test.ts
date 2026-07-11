/**
 * Validation report for `defineTheme`'s role -> scope table (the taste
 * decision documented in `src/theme-vars.js`'s `ROLE_SCOPES`): for every
 * shipped palette, compute the best-fit role assignment (per role, the
 * dominant color among its mapped scope vars actually present in that
 * palette) and measure the fraction of the palette's color-scope vars that
 * assignment exactly reconstructs.
 *
 * There is no hard threshold — this exists so the numbers are seen. A low
 * median suggests the role grouping doesn't fit the shipped-theme corpus
 * well and should prompt a follow-up look at the table, not a unilateral
 * redesign here.
 */
import fs from "node:fs";
import path from "node:path";
import type { ThemePalette } from "../src/theme.d.ts";
import { parseScopeKey, ROLE_SCOPES, varName } from "../src/theme-vars.js";

const THEMES_DIR = path.join(import.meta.dir, "../src/themes");

const themeNames = fs
  .readdirSync(THEMES_DIR)
  .filter((f) => f.endsWith(".js") && f !== "index.js" && !f.startsWith("_"))
  .map((f) => f.replace(/\.js$/, ""))
  .sort();

const NON_COLOR_SUFFIXES = [
  "-bg",
  "-font-style",
  "-font-weight",
  "-text-decoration",
];

function isColorVar(key: string): boolean {
  return !NON_COLOR_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/** var name -> role that claims it, per `ROLE_SCOPES` plus the two
 * base-scope roles `defineTheme` special-cases. */
const VAR_TO_ROLE = new Map<string, string>();
VAR_TO_ROLE.set(varName([], "color") as string, "foreground");
VAR_TO_ROLE.set(varName([], "background-color") as string, "background");
for (const [role, scopeKeys] of Object.entries(ROLE_SCOPES)) {
  for (const scopeKey of scopeKeys) {
    const vn = varName(parseScopeKey(scopeKey), "color");
    if (vn) VAR_TO_ROLE.set(vn, role);
  }
}

/** For each role, the most frequent value among its mapped vars that are
 * actually present in `vars` (ties keep the first-seen value). */
function bestFitRoleValues(vars: Record<string, string>): Map<string, string> {
  const roleValues = new Map<string, Map<string, number>>();

  for (const [vn, role] of VAR_TO_ROLE) {
    const value = vars[vn];
    if (value === undefined) continue;
    let counts = roleValues.get(role);
    if (!counts) {
      counts = new Map();
      roleValues.set(role, counts);
    }
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const dominant = new Map<string, string>();
  for (const [role, counts] of roleValues) {
    let bestValue: string | undefined;
    let bestCount = -1;
    for (const [value, count] of counts) {
      if (count > bestCount) {
        bestValue = value;
        bestCount = count;
      }
    }
    if (bestValue !== undefined) dominant.set(role, bestValue);
  }
  return dominant;
}

type ReportEntry = {
  name: string;
  reconstructed: number;
  total: number;
  percent: number;
};

function reconstructionReport(palette: ThemePalette): ReportEntry {
  const dominant = bestFitRoleValues(palette.vars);

  let total = 0;
  let reconstructed = 0;
  for (const [key, value] of Object.entries(palette.vars)) {
    if (!isColorVar(key)) continue;
    total++;
    const role = VAR_TO_ROLE.get(key);
    if (role && dominant.get(role) === value) reconstructed++;
  }

  const percent = total === 0 ? 100 : (reconstructed / total) * 100;
  return { name: palette.name, reconstructed, total, percent };
}

describe("defineTheme role-map validation report", () => {
  it("computes and reports role-reconstruction fidelity for every shipped theme", async () => {
    const modules = (await Promise.all(
      themeNames.map((name) => import(path.join(THEMES_DIR, `${name}.js`))),
    )) as Array<{ default: ThemePalette }>;
    const entries = modules.map((mod) => reconstructionReport(mod.default));

    expect(entries).toHaveLength(themeNames.length);
    for (const entry of entries) {
      expect(entry.percent).toBeGreaterThanOrEqual(0);
      expect(entry.percent).toBeLessThanOrEqual(100);
    }

    const sorted = [...entries].sort((a, b) => a.percent - b.percent);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? ((sorted[mid - 1]?.percent ?? 0) + (sorted[mid]?.percent ?? 0)) / 2
        : (sorted[mid]?.percent ?? 0);

    const worst = sorted.slice(0, 10);

    console.log(
      `\ndefineTheme role-map reconstruction: median ${median.toFixed(1)}% across ${entries.length} themes`,
    );
    console.log("Worst offenders:");
    for (const entry of worst) {
      console.log(
        `  ${entry.name}: ${entry.percent.toFixed(1)}% (${entry.reconstructed}/${entry.total})`,
      );
    }

    if (median < 60) {
      console.log(
        "NOTE: median reconstruction is below ~60% — this may indicate a role-mapping error and is worth a follow-up look (not auto-fixed here).",
      );
    }
  });
});
