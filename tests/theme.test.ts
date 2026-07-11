import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { defineTheme, extendTheme, paletteToCss } from "../src/theme.js";
import type { ThemeDefinition, ThemePalette } from "../src/theme.d.ts";

const THEME_VAR_GRAMMAR = /^--shl-[\w-]+$/;

describe("defineTheme", () => {
  it("requires roles.foreground and roles.background when there's no extends", () => {
    expect(() => defineTheme({ roles: { background: "#000" } })).toThrow(
      /roles\.foreground/,
    );
    expect(() => defineTheme({ roles: { foreground: "#fff" } })).toThrow(
      /roles\.background/,
    );
    expect(() => defineTheme({})).toThrow(/roles\.foreground/);
  });

  it("does not require foreground/background when extending a palette", () => {
    const palette = defineTheme({
      extends: {
        name: "base",
        colorScheme: "dark",
        vars: { "--shl-fg": "#fff", "--shl-bg": "#000" },
      },
      roles: { keyword: "#f0f" },
    });
    expect(palette.vars["--shl-fg"]).toBe("#fff");
    expect(palette.vars["--shl-bg"]).toBe("#000");
    expect(palette.vars["--shl-keyword"]).toBe("#f0f");
  });

  it("maps foreground/background roles to --shl-fg/--shl-bg", () => {
    const palette = defineTheme({
      roles: { foreground: "#d6deeb", background: "#0b1021" },
    });
    expect(palette.vars).toEqual({
      "--shl-fg": "#d6deeb",
      "--shl-bg": "#0b1021",
    });
  });

  it("expands the comment role to comment + quote, including TokenStyle fields as suffixed vars", () => {
    const palette = defineTheme({
      roles: {
        foreground: "#fff",
        background: "#000",
        comment: { color: "#637777", fontStyle: "italic" },
      },
    });
    expect(palette.vars["--shl-comment"]).toBe("#637777");
    expect(palette.vars["--shl-comment-font-style"]).toBe("italic");
    expect(palette.vars["--shl-quote"]).toBe("#637777");
    expect(palette.vars["--shl-quote-font-style"]).toBe("italic");
  });

  it("expands the keyword role across all its mapped scopes, including the descendant 'meta keyword'", () => {
    const palette = defineTheme({
      roles: { foreground: "#fff", background: "#000", keyword: "#c792ea" },
    });
    for (const key of [
      "--shl-keyword",
      "--shl-doctag",
      "--shl-formula",
      "--shl-template-tag",
      "--shl-meta-keyword",
    ] as const) {
      expect(palette.vars[key]).toBe("#c792ea");
    }
  });

  it("expands the function role to the compound 'title.function_' var", () => {
    const palette = defineTheme({
      roles: { foreground: "#fff", background: "#000", function: "#82aaff" },
    });
    expect(palette.vars["--shl-title"]).toBe("#82aaff");
    expect(palette.vars["--shl-title-function_"]).toBe("#82aaff");
  });

  it("expands every TokenStyle field to its suffixed var (color/background/fontStyle/fontWeight/textDecoration)", () => {
    const palette = defineTheme({
      roles: {
        foreground: "#fff",
        background: "#000",
        addition: {
          color: "#0f0",
          background: "#001100",
          fontStyle: "italic",
          fontWeight: "bold",
          textDecoration: "underline",
        },
      },
    });
    expect(palette.vars["--shl-addition"]).toBe("#0f0");
    expect(palette.vars["--shl-addition-bg"]).toBe("#001100");
    expect(palette.vars["--shl-addition-font-style"]).toBe("italic");
    expect(palette.vars["--shl-addition-font-weight"]).toBe("bold");
    expect(palette.vars["--shl-addition-text-decoration"]).toBe("underline");
  });

  it("treats a bare string the same as { color: string }", () => {
    const a = defineTheme({
      roles: { foreground: "#fff", background: "#000", keyword: "#f0f" },
    });
    const b = defineTheme({
      roles: {
        foreground: "#fff",
        background: "#000",
        keyword: { color: "#f0f" },
      },
    });
    expect(a.vars).toEqual(b.vars);
  });

  it("applies precedence extends < roles < scopes, overwriting per-var not per-role", () => {
    const base: ThemePalette = {
      name: "base",
      colorScheme: "dark",
      vars: {
        "--shl-fg": "#000",
        "--shl-bg": "#fff",
        "--shl-keyword": "#111",
        "--shl-doctag": "#222",
      },
    };
    const palette = defineTheme({
      extends: base,
      roles: { keyword: "#c792ea" }, // writes --shl-keyword and --shl-doctag (and others)
      scopes: { keyword: "#ff0000" }, // overrides only --shl-keyword
    });
    expect(palette.vars["--shl-keyword"]).toBe("#ff0000");
    expect(palette.vars["--shl-doctag"]).toBe("#c792ea");
  });

  it("scopes overrides parse compound (dot) and descendant (space) keys the same way the build does", () => {
    const palette = defineTheme({
      roles: { foreground: "#fff", background: "#000" },
      scopes: { "title.class_": "#ffd700", "meta keyword": "#5f7e97" },
    });
    expect(palette.vars["--shl-title-class_"]).toBe("#ffd700");
    expect(palette.vars["--shl-meta-keyword"]).toBe("#5f7e97");
  });

  it("infers colorScheme from background luminance when not given", () => {
    const dark = defineTheme({
      roles: { foreground: "#fff", background: "#000000" },
    });
    const light = defineTheme({
      roles: { foreground: "#000", background: "#ffffff" },
    });
    expect(dark.colorScheme).toBe("dark");
    expect(light.colorScheme).toBe("light");
  });

  it("uses an explicit colorScheme over the inferred one", () => {
    const palette = defineTheme({
      colorScheme: "light",
      roles: { foreground: "#000", background: "#000000" },
    });
    expect(palette.colorScheme).toBe("light");
  });

  it("defaults name to 'custom-theme'", () => {
    const palette = defineTheme({
      roles: { foreground: "#fff", background: "#000" },
    });
    expect(palette.name).toBe("custom-theme");
  });

  it("produces a well-formed ThemePalette: every var key matches the --shl-* grammar", () => {
    const palette = defineTheme({
      roles: {
        foreground: "#fff",
        background: "#000",
        comment: { color: "#888", fontStyle: "italic" },
        type: "#eee",
      },
      scopes: { "title.class_": "#f00" },
    });
    for (const key of Object.keys(palette.vars)) {
      expect(key).toMatch(THEME_VAR_GRAMMAR);
    }
  });
});

describe("extendTheme", () => {
  it("is equivalent to defineTheme({ ...overrides, extends: base })", async () => {
    const { default: atomOneDark } = (await import(
      "../src/themes/atom-one-dark.js"
    )) as {
      default: ThemePalette;
    };
    const a = extendTheme(atomOneDark, { roles: { keyword: "#ff79c6" } });
    const b = defineTheme({
      extends: atomOneDark,
      roles: { keyword: "#ff79c6" },
    });
    expect(a).toEqual(b);
  });

  it("round-trips a shipped palette's vars deep-equal when given no overrides", async () => {
    const { default: atomOneDark } = (await import(
      "../src/themes/atom-one-dark.js"
    )) as {
      default: ThemePalette;
    };
    const roundTripped = extendTheme(atomOneDark, {});
    expect(roundTripped.vars).toEqual(atomOneDark.vars);
  });
});

describe("paletteToCss", () => {
  it("matches the generated themes/<name>.css artifact for a shipped palette", async () => {
    const { default: atomOneDark } = (await import(
      "../src/themes/atom-one-dark.js"
    )) as {
      default: ThemePalette;
    };
    const generatedCss = fs.readFileSync(
      path.join(import.meta.dir, "../src/themes/atom-one-dark.css"),
      "utf8",
    );
    expect(paletteToCss(atomOneDark)).toBe(generatedCss);
  });

  it("output parses via PostCSS into declarations equal to the generated CSS", async () => {
    const { default: atomOneDark } = (await import(
      "../src/themes/atom-one-dark.js"
    )) as {
      default: ThemePalette;
    };
    const generatedCss = fs.readFileSync(
      path.join(import.meta.dir, "../src/themes/atom-one-dark.css"),
      "utf8",
    );

    function declMap(css: string) {
      const root = postcss.parse(css);
      const map = new Map<string, Map<string, string>>();
      root.walkRules((rule) => {
        for (const selector of rule.selectors) {
          const decls = map.get(selector) ?? new Map<string, string>();
          rule.walkDecls((decl) => {
            decls.set(decl.prop, decl.value);
          });
          map.set(selector, decls);
        }
      });
      return map;
    }

    expect(declMap(paletteToCss(atomOneDark))).toEqual(declMap(generatedCss));
  });

  it("root defaults to true and selector defaults to [data-shl-theme=name]", () => {
    const palette = defineTheme({
      name: "midnight",
      roles: { foreground: "#fff", background: "#000" },
    });
    const css = paletteToCss(palette);
    expect(css).toContain(":root{");
    expect(css).toContain('[data-shl-theme="midnight"]{');
  });

  it("omits the :root block when root: false", () => {
    const palette = defineTheme({
      name: "midnight",
      roles: { foreground: "#fff", background: "#000" },
    });
    const css = paletteToCss(palette, { root: false });
    expect(css).not.toContain(":root{");
    expect(css).toContain('[data-shl-theme="midnight"]{');
  });

  it("honors a custom selector", () => {
    const palette = defineTheme({
      name: "midnight",
      roles: { foreground: "#fff", background: "#000" },
    });
    const css = paletteToCss(palette, { selector: ".my-theme" });
    expect(css).toContain(".my-theme{");
    expect(css).not.toContain("[data-shl-theme");
  });

  it("includes extras verbatim when present", () => {
    const palette: ThemePalette = {
      name: "gradients",
      colorScheme: "dark",
      vars: { "--shl-fg": "#fff", "--shl-bg": "#000" },
      extras: ".hljs{background-image:linear-gradient(red,blue)}",
    };
    const css = paletteToCss(palette);
    expect(css).toContain(".hljs{background-image:linear-gradient(red,blue)}");
  });
});

describe("ThemeDefinition types", () => {
  it("rejects an unknown role key at the type level", () => {
    const valid: ThemeDefinition = { roles: { keyword: "#fff" } };
    expect(valid.roles?.keyword).toBe("#fff");

    // @ts-expect-error - "bogusRole" is not a ThemeRole
    const invalid: ThemeDefinition = { roles: { bogusRole: "#fff" } };
    expect(invalid).toBeDefined();
  });
});
