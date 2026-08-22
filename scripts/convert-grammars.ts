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

/** Drops the default `relevance: 1` from every state; engine.js re-defaults it on load. */
function stripDefaults(ir: GrammarIR): GrammarIR {
  for (const state of ir.states) {
    if (state.relevance === 1) {
      // biome-ignore lint/performance/noDelete: one-time build-step compaction, not a hot path
      delete (state as { relevance?: number }).relevance;
    }
  }
  return ir;
}

/**
 * Fixed `subLanguage` embed targets for this grammar. Single name (astro ->
 * typescript) or a fixed candidate list (html -> css for `<style>` tags).
 * Empty `subLanguage: []` (markdown fenced blocks) is omitted: no fixed name.
 */
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

/**
 * Converts every shipped grammar to plain-JSON IR, overwriting the `register`
 * field of each `src/languages/<name>.js` module from buildLanguages().
 */
export async function convertGrammars() {
  console.time("convert grammars");
  const entries = buildLanguageEntries();

  // Fresh import so we read files buildLanguages() just wrote.
  const index = (await import(
    "../src/languages/index.js"
  )) as unknown as Record<string, LanguageModule>;

  function getModule(entry: (typeof entries)[number]): LanguageModule {
    const mod = index[entry.moduleName];
    if (!mod) throw new Error(`generated module missing for "${entry.name}"`);
    return mod;
  }

  // One hljs instance so sublanguage refs resolve in any conversion order.
  const hljs = hljsCore.newInstance();
  for (const entry of entries) {
    const mod = getModule(entry);
    hljs.registerLanguage(mod.name, mod.register);
  }

  const entryByName = new Map(entries.map((entry) => [entry.name, entry]));

  let clean = 0;
  let unminifiedBytes = 0;
  let minifiedBytes = 0;
  const warningsByLanguage: [string, string[]][] = [];
  const failed: [string, string][] = [];
  // Final (post-stripDefaults) IR per language, keyed by name - handed to
  // buildDetectIndex() directly so it scores the exact IR just written to
  // disk, without re-importing (and hitting the ESM module cache for) the
  // files this function just overwrote.
  const irByName = new Map<string, GrammarIR>();

  const files = entries
    .map((entry) => {
      const mod = getModule(entry);
      let ir: GrammarIR;
      let warnings: string[];
      try {
        ({ ir, warnings } = convertLanguage(hljs, mod.name));
      } catch (error) {
        failed.push([entry.name, (error as Error).message]);
        return null;
      }
      stripDefaults(ir);
      irByName.set(entry.name, ir);

      if (warnings.length === 0) clean++;
      else warningsByLanguage.push([entry.name, warnings]);

      const moduleExport = {
        name: entry.name,
        aliases: ir.aliases,
        register: ir,
      };
      let irJson = JSON.stringify(moduleExport);
      unminifiedBytes += JSON.stringify(moduleExport, null, 2).length;
      minifiedBytes += irJson.length;

      // Custom grammars used to self-register sublanguage deps via hljs side
      // effects. Import the same closure here for registerAll. hljs built-ins
      // are unchanged: cross-built-in embedding was never wired up.
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
      // Cast, not contextual type: keyword tables can name keys "constructor"
      // or "toString" (kotlin, nix), which conflict with Object.prototype
      // under contextual typing.
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
  console.log(
    `IR size: ${(minifiedBytes / 1024).toFixed(0)} KB minified, ` +
      `${(unminifiedBytes / 1024).toFixed(0)} KB pretty-printed`,
  );
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
  return irByName;
}
