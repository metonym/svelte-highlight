import { readFileSync } from "node:fs";
import hljsCore from "highlight.js/lib/core";
import hljsPackageJson from "highlight.js/package.json" with { type: "json" };
import { convertLanguage } from "../src/convert-language.js";
import type { GrammarIR } from "../src/engine.d.ts";
import { buildLanguageEntries } from "./build-languages.ts";
import { writeTo } from "./utils/write-to.ts";

interface LanguageModule {
  name: string;
  register: any;
}

const HLJS_VERSION = hljsPackageJson.version;

const licenseBanner = (name: string) =>
  `/*!
 * Grammar "${name}" derived from highlight.js ${HLJS_VERSION} (BSD-3-Clause).
 * Copyright (c) 2006, Ivan Sagalaev. Full text: LICENSE.highlight.txt.
 */
`;

/**
 * Drops default fields and replaces keyword maps with indexes into deduped,
 * word-grouped `keywordTables` (expanded back by engine.js `compileProgram`).
 */
function compactIR({
  caseInsensitive,
  unicode,
  disableAutodetect,
  states,
  ...ir
}: GrammarIR): GrammarIR {
  const keywordTables: Array<Array<[string, number, string]>> = [];
  const tableIndex = new Map<string, number>();
  const tableFor = (keywords: Record<string, [string, number]>) => {
    // Consecutive runs, not full groups, so expansion keeps key order.
    const groups: Array<[string, number, string[]]> = [];
    for (const [word, [scope, relevance]] of Object.entries(keywords)) {
      if (word.includes(" ")) throw new Error(`keyword "${word}" has a space`);
      const last = groups.at(-1);
      if (last?.[0] === scope && last[1] === relevance) last[2].push(word);
      else groups.push([scope, relevance, [word]]);
    }
    const table = groups.map(
      ([scope, relevance, words]): [string, number, string] => [
        scope,
        relevance,
        words.join(" "),
      ],
    );
    const key = JSON.stringify(table);
    let index = tableIndex.get(key);
    if (index === undefined) {
      index = keywordTables.push(table) - 1;
      tableIndex.set(key, index);
    }
    return index;
  };
  return {
    ...ir,
    ...(caseInsensitive && { caseInsensitive }),
    ...(unicode && { unicode }),
    ...(disableAutodetect && { disableAutodetect }),
    states: states.map(({ relevance, rules, keywords, ...state }) => ({
      ...state,
      ...(relevance !== 1 && { relevance }),
      ...(rules?.length && { rules }),
      ...(keywords !== undefined && {
        keywords: typeof keywords === "number" ? keywords : tableFor(keywords),
      }),
    })),
    ...(keywordTables.length > 0 && { keywordTables }),
  };
}

function collectSubLanguageDependencies(ir: GrammarIR): string[] {
  const names = new Set<string>();
  for (const state of ir.states) {
    const subLanguage = state.subLanguage;
    if (typeof subLanguage === "string") {
      if (subLanguage !== ir.name) names.add(subLanguage);
    } else if (Array.isArray(subLanguage)) {
      for (const name of subLanguage) {
        if (name !== ir.name) names.add(name);
      }
    }
  }
  return [...names];
}

/** Rewrites each `src/languages/<name>.js` from buildLanguages() as JSON IR. */
export async function convertGrammars() {
  console.time("convert grammars");
  const entries = buildLanguageEntries();

  const index = (await import(
    "../src/languages/index.js"
  )) as unknown as Record<string, LanguageModule>;

  function getModule(entry: (typeof entries)[number]): LanguageModule {
    const mod = index[entry.moduleName];
    if (!mod) throw new Error(`generated module missing for "${entry.name}"`);
    return mod;
  }

  // Patched built-ins register last: custom grammars re-register the stock
  // built-ins they embed (astro -> typescript), and the last one wins.
  const hljs = hljsCore.newInstance();
  for (const entry of [
    ...entries.filter((entry) => !entry.patchPath),
    ...entries.filter((entry) => entry.patchPath),
  ]) {
    const mod = getModule(entry);
    hljs.registerLanguage(mod.name, mod.register);
  }

  const entryByName = new Map(entries.map((entry) => [entry.name, entry]));

  // Module source recovers outer-scope data a callback's `toString()` can't.
  const hljsSources = new Map<string, string>();
  for (const entry of entries) {
    if (entry.kind !== "hljs") continue;
    try {
      const path = Bun.resolveSync(
        `highlight.js/lib/languages/${entry.name}`,
        import.meta.dir,
      );
      hljsSources.set(entry.name, readFileSync(path, "utf8"));
    } catch {
      // Best-effort: convertLanguage warns if it needed the source.
    }
  }

  let clean = 0;
  let minifiedBytes = 0;
  const warningsByLanguage: [string, string[]][] = [];
  const failed: [string, string][] = [];

  const files = entries
    .map((entry) => {
      const mod = getModule(entry);
      let ir: GrammarIR;
      let warnings: string[];
      try {
        ({ ir, warnings } = convertLanguage(
          hljs,
          mod.name,
          hljsSources.get(entry.name),
        ));
      } catch (error) {
        failed.push([entry.name, (error as Error).message]);
        return null;
      }
      ir = compactIR(ir);

      if (warnings.length === 0) clean++;
      else warningsByLanguage.push([entry.name, warnings]);

      const moduleExport = {
        name: entry.name,
        aliases: ir.aliases,
        register: ir,
      };
      let irJson = JSON.stringify(moduleExport);
      minifiedBytes += irJson.length;

      // Custom grammars import their sublanguage deps for registerAll.
      let importLines = "";
      if (entry.kind === "custom") {
        const depEntries = collectSubLanguageDependencies(ir)
          .map((name) => entryByName.get(name))
          .filter((depEntry) => depEntry !== undefined);
        if (depEntries.length > 0) {
          const depModuleNames = depEntries.map(
            (depEntry) => depEntry.moduleName,
          );
          importLines = depEntries
            .map(
              (depEntry) =>
                `import ${depEntry.moduleName} from "./${depEntry.name}.js";\n`,
            )
            .join("");
          irJson = `${irJson.slice(0, -1)},"dependencies":[${depModuleNames.join(",")}]}`;
        }
      }

      const banner = entry.kind === "hljs" ? licenseBanner(entry.name) : "";
      // Cast, not contextual type: keys like "constructor" (kotlin, nix)
      // conflict with Object.prototype under contextual typing.
      const typeName = `import("./index.d.ts").LanguageType<"${entry.name}">`;
      const content = `${importLines}${banner}export const ${entry.moduleName} = /** @type {${typeName}} */ (${irJson});
export default ${entry.moduleName};
`;
      return { path: `src/languages/${entry.name}.js`, content };
    })
    .filter((file): file is { path: string; content: string } => file !== null);

  await Promise.all(files.map(({ path, content }) => writeTo(path, content)));

  const licenseHeader = `Third-party notice
==================

svelte-highlight ships grammar definitions derived from highlight.js
${HLJS_VERSION} (https://github.com/highlightjs/highlight.js), used under the
BSD-3-Clause license below. Each derived grammar module carries a banner
pointing back to this file. The svelte-highlight engine itself and all
custom (non-hljs-derived) grammars are original code under this package's
MIT license.

`;
  const hljsLicense = await Bun.file(
    `${import.meta.dir}/../node_modules/highlight.js/LICENSE`,
  ).text();
  await writeTo("LICENSE.highlight.txt", licenseHeader + hljsLicense);

  console.log(
    `convert-grammars: ${entries.length} grammars, ${clean} clean, ` +
      `${warningsByLanguage.length} with warnings, ${failed.length} failed`,
  );
  console.log(`IR size: ${(minifiedBytes / 1024).toFixed(0)} KB minified`);
  if (warningsByLanguage.length > 0) {
    console.log("\nconversion warnings:");
    for (const [name, warnings] of warningsByLanguage) {
      for (const warning of warnings) console.log(`  ${name}: ${warning}`);
    }
  }
  if (failed.length > 0) {
    console.log("\nconversion failures:");
    for (const [name, message] of failed) console.log(`  ${name}: ${message}`);
    throw new Error(
      `convert-grammars: ${failed.length} grammar(s) failed to convert`,
    );
  }

  console.timeEnd("convert grammars");
}
