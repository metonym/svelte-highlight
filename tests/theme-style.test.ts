import {
  dualPaletteStyle,
  dualPaletteSupportsStyle,
  lightFallbackStyle,
  mergeLightDarkVars,
  paletteStyle,
  resolveThemeVar,
  varsToStyle,
} from "../src/theme-style.js";

describe("resolveThemeVar", () => {
  it("returns the direct value when present", () => {
    expect(
      resolveThemeVar({ "--shl-keyword": "red" }, "--shl-keyword", {}),
    ).toBe("red");
  });

  it("falls back through the fallback map when the key is missing", () => {
    const vars = { "--shl-title": "blue" };
    const fallbacks = { "--shl-title-class_": "--shl-title" };
    expect(resolveThemeVar(vars, "--shl-title-class_", fallbacks)).toBe("blue");
  });

  it("falls back to --shl-fg for an unresolved color key", () => {
    const vars = { "--shl-fg": "black" };
    expect(resolveThemeVar(vars, "--shl-keyword", {})).toBe("black");
  });

  it("does not fall back to --shl-fg for a non-color (suffixed) key", () => {
    const vars = { "--shl-fg": "black" };
    expect(
      resolveThemeVar(vars, "--shl-keyword-font-style", {}),
    ).toBeUndefined();
  });

  it("does not fall back to --shl-fg for --shl-bg itself", () => {
    const vars = { "--shl-fg": "black" };
    expect(resolveThemeVar(vars, "--shl-bg", {})).toBeUndefined();
  });

  it("returns undefined when nothing resolves", () => {
    expect(resolveThemeVar({}, "--shl-keyword", {})).toBeUndefined();
  });
});

describe("mergeLightDarkVars", () => {
  it("emits light-dark() for keys both sides declare directly", () => {
    const merged = mergeLightDarkVars(
      { "--shl-keyword": "purple" },
      { "--shl-keyword": "violet" },
      {},
    );
    expect(merged["--shl-keyword"]).toBe("light-dark(purple, violet)");
  });

  it("resolves a one-sided key via the fallback chain before merging", () => {
    // light never sets --shl-title-class_ directly; falls back to its
    // --shl-title.
    const merged = mergeLightDarkVars(
      { "--shl-title": "navy" },
      { "--shl-title-class_": "gold", "--shl-title": "yellow" },
      { "--shl-title-class_": "--shl-title" },
    );
    expect(merged["--shl-title-class_"]).toBe("light-dark(navy, gold)");
  });

  it("resolves a one-sided key via --shl-fg when no fallback entry exists", () => {
    const merged = mergeLightDarkVars(
      { "--shl-fg": "black" },
      { "--shl-keyword": "violet", "--shl-fg": "white" },
      {},
    );
    expect(merged["--shl-keyword"]).toBe("light-dark(black, violet)");
  });

  it("omits a key entirely when one side can't resolve it at all", () => {
    const merged = mergeLightDarkVars(
      {},
      { "--shl-keyword-font-style": "italic" },
      {},
    );
    expect(merged["--shl-keyword-font-style"]).toBeUndefined();
  });
});

describe("varsToStyle", () => {
  it("joins entries as key:value pairs", () => {
    expect(varsToStyle({ "--shl-fg": "black", "--shl-bg": "white" })).toBe(
      "--shl-fg:black;--shl-bg:white",
    );
  });

  it("returns an empty string for no vars", () => {
    expect(varsToStyle({})).toBe("");
  });
});

describe("paletteStyle", () => {
  it("serializes a single palette's vars plus its color-scheme", () => {
    const palette = {
      name: "test",
      colorScheme: "dark" as const,
      vars: { "--shl-fg": "#fff", "--shl-bg": "#000" },
    };
    expect(paletteStyle(palette)).toBe(
      "--shl-fg:#fff;--shl-bg:#000;color-scheme:dark",
    );
  });
});

describe("dualPaletteStyle", () => {
  const light = {
    name: "light",
    colorScheme: "light" as const,
    vars: { "--shl-fg": "#000", "--shl-bg": "#fff" },
  };
  const dark = {
    name: "dark",
    colorScheme: "dark" as const,
    vars: { "--shl-fg": "#fff", "--shl-bg": "#000" },
  };

  it("emits light-dark() vars plus color-scheme: light dark for auto", () => {
    const style = dualPaletteStyle(light, dark, "auto");
    expect(style).toContain("--shl-fg:light-dark(#000, #fff)");
    expect(style).toContain("--shl-bg:light-dark(#fff, #000)");
    expect(style).toContain("color-scheme:light dark");
  });

  it("forces color-scheme: light for mode=light", () => {
    expect(dualPaletteStyle(light, dark, "light")).toContain(
      "color-scheme:light",
    );
  });

  it("forces color-scheme: dark for mode=dark", () => {
    expect(dualPaletteStyle(light, dark, "dark")).toContain(
      "color-scheme:dark",
    );
  });

  it("omits color-scheme for an app-controlled selector mode", () => {
    const style = dualPaletteStyle(light, dark, '[data-theme="dark"]');
    expect(style).not.toContain("color-scheme");
  });
});

describe("lightFallbackStyle", () => {
  it("emits the light side's plain value for keys both sides declare", () => {
    const style = lightFallbackStyle(
      {
        name: "light",
        colorScheme: "light",
        vars: { "--shl-keyword": "purple" },
      },
      {
        name: "dark",
        colorScheme: "dark",
        vars: { "--shl-keyword": "violet" },
      },
    );
    expect(style).toBe("--shl-keyword:purple");
  });

  it("resolves a one-sided key via the fallback chain (light only)", () => {
    const style = lightFallbackStyle(
      { name: "light", colorScheme: "light", vars: { "--shl-title": "navy" } },
      {
        name: "dark",
        colorScheme: "dark",
        vars: { "--shl-title-class_": "gold" },
      },
    );
    expect(style).toContain("--shl-title-class_:navy");
  });

  it("omits a key resolvable only via the dark side", () => {
    const style = lightFallbackStyle(
      { name: "light", colorScheme: "light", vars: {} },
      {
        name: "dark",
        colorScheme: "dark",
        vars: { "--shl-keyword": "violet" },
      },
    );
    expect(style).not.toContain("--shl-keyword");
  });
});

describe("dualPaletteSupportsStyle", () => {
  const light = {
    name: "light",
    colorScheme: "light" as const,
    vars: { "--shl-fg": "#000", "--shl-bg": "#fff" },
  };
  const dark = {
    name: "dark",
    colorScheme: "dark" as const,
    vars: { "--shl-fg": "#fff", "--shl-bg": "#000" },
  };

  it("wraps light-dark() declarations in an @supports block with !important", () => {
    const style = dualPaletteSupportsStyle("svh-scope-1", light, dark, "auto");
    expect(style).toContain(
      "@supports (color: light-dark(#000, #000)){.svh-scope-1{",
    );
    expect(style).toContain("--shl-fg:light-dark(#000, #fff) !important");
    expect(style).toContain("--shl-bg:light-dark(#fff, #000) !important");
    expect(style.startsWith("<style>")).toBe(true);
    expect(style.endsWith("</style>")).toBe(true);
  });

  it("includes color-scheme with !important for a resolved mode", () => {
    const style = dualPaletteSupportsStyle("svh-scope-1", light, dark, "auto");
    expect(style).toContain("color-scheme:light dark !important");
  });

  it("omits color-scheme for an app-controlled selector mode", () => {
    const style = dualPaletteSupportsStyle(
      "svh-scope-1",
      light,
      dark,
      '[data-theme="dark"]',
    );
    expect(style).not.toContain("color-scheme");
  });

  it("attaches a CSP nonce to the <style> tag", () => {
    const style = dualPaletteSupportsStyle(
      "svh-scope-1",
      light,
      dark,
      "auto",
      "abc",
    );
    expect(style.startsWith('<style nonce="abc">')).toBe(true);
  });
});
