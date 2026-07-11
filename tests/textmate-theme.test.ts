import { fromTextMate } from "../src/textmate-theme.js";

describe("fromTextMate", () => {
  it("resolves fg/bg from colors[editor.foreground/background]", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [],
    });
    expect(palette.vars["--shl-fg"]).toBe("#eee");
    expect(palette.vars["--shl-bg"]).toBe("#111");
  });

  it("falls back to the global (no-scope) tokenColors settings entry for fg/bg", () => {
    const palette = fromTextMate({
      tokenColors: [
        { settings: { foreground: "#aaa", background: "#222" } },
        { scope: "keyword", settings: { foreground: "#f0f" } },
      ],
    });
    expect(palette.vars["--shl-fg"]).toBe("#aaa");
    expect(palette.vars["--shl-bg"]).toBe("#222");
  });

  it("prefers colors[] over the global tokenColors entry when both are present", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [{ settings: { foreground: "#aaa", background: "#222" } }],
    });
    expect(palette.vars["--shl-fg"]).toBe("#eee");
    expect(palette.vars["--shl-bg"]).toBe("#111");
  });

  it("throws a descriptive error when foreground can't be resolved", () => {
    expect(() =>
      fromTextMate({
        colors: { "editor.background": "#111" },
        tokenColors: [],
      }),
    ).toThrow(/foreground/);
  });

  it("throws a descriptive error when background can't be resolved", () => {
    expect(() =>
      fromTextMate({
        colors: { "editor.foreground": "#eee" },
        tokenColors: [],
      }),
    ).toThrow(/background/);
  });

  it("matches scope selectors by segment-prefix", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [
        {
          scope: "entity.name.function.method.ts",
          settings: { foreground: "#0af" },
        },
      ],
    });
    expect(palette.vars["--shl-title-function_"]).toBe("#0af");
  });

  it("resolves a specificity conflict in favor of the longest matching selector", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [
        { scope: "entity.name", settings: { foreground: "#111111" } },
        { scope: "entity.name.function", settings: { foreground: "#222222" } },
      ],
    });
    // "entity.name" alone isn't in the starter table, so only the more
    // specific "entity.name.function" row should resolve.
    expect(palette.vars["--shl-title-function_"]).toBe("#222222");
  });

  it("breaks a specificity tie in favor of the later entry (VS Code order semantics)", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [
        { scope: "entity.name.type", settings: { foreground: "#111111" } },
        { scope: "entity.name.class", settings: { foreground: "#222222" } },
      ],
    });
    // Both starter rows ("entity.name.type", "entity.name.class") map to
    // "title.class_" at equal specificity (3 segments each) — the later
    // entry wins.
    expect(palette.vars["--shl-title-class_"]).toBe("#222222");
  });

  it("treats comma-separated scopes as individual selectors", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [
        { scope: "keyword, storage.type", settings: { foreground: "#c0f" } },
      ],
    });
    expect(palette.vars["--shl-keyword"]).toBe("#c0f");
  });

  it("treats array scopes as individual selectors", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [
        {
          scope: ["entity.name.function", "support.function"],
          settings: { foreground: "#0af" },
        },
      ],
    });
    expect(palette.vars["--shl-title-function_"]).toBe("#0af");
  });

  it("maps fontStyle combinations to font-style/font-weight/text-decoration vars", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [
        {
          scope: "comment",
          settings: { foreground: "#666", fontStyle: "italic bold underline" },
        },
      ],
    });
    expect(palette.vars["--shl-comment-font-style"]).toBe("italic");
    expect(palette.vars["--shl-comment-font-weight"]).toBe("bold");
    expect(palette.vars["--shl-comment-text-decoration"]).toBe("underline");
  });

  it("surfaces warnings for tokenColors entries whose scope has no starter-table mapping", () => {
    const warnings: string[] = [];
    fromTextMate(
      {
        colors: { "editor.foreground": "#eee", "editor.background": "#111" },
        tokenColors: [
          { scope: "totally.unknown.scope", settings: { foreground: "#bad" } },
        ],
      },
      { onWarn: (message) => warnings.push(message) },
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/totally\.unknown\.scope/);
  });

  it("skips descendant (space-separated) selectors and surfaces a warning instead of mis-matching", () => {
    const warnings: string[] = [];
    const palette = fromTextMate(
      {
        colors: { "editor.foreground": "#eee", "editor.background": "#111" },
        tokenColors: [
          {
            scope: "source.js entity.name.function",
            settings: { foreground: "#bad" },
          },
        ],
      },
      { onWarn: (message) => warnings.push(message) },
    );
    expect(palette.vars["--shl-title-function_"]).toBeUndefined();
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/descendant selector/);
  });

  it("never silently drops an unmappable entry (onWarn is required to observe it, but the palette still omits it)", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [
        { scope: "totally.unknown.scope", settings: { foreground: "#bad" } },
      ],
    });
    expect(Object.values(palette.vars)).not.toContain("#bad");
  });

  it("infers colorScheme from background luminance when type is absent", () => {
    const dark = fromTextMate({
      colors: { "editor.foreground": "#fff", "editor.background": "#000000" },
      tokenColors: [],
    });
    const light = fromTextMate({
      colors: { "editor.foreground": "#000", "editor.background": "#ffffff" },
      tokenColors: [],
    });
    expect(dark.colorScheme).toBe("dark");
    expect(light.colorScheme).toBe("light");
  });

  it("uses type when it's exactly 'light' or 'dark'", () => {
    const palette = fromTextMate({
      type: "light",
      colors: { "editor.foreground": "#000", "editor.background": "#000000" },
      tokenColors: [],
    });
    expect(palette.colorScheme).toBe("light");
  });

  it("falls back to luminance for a non-light/dark type (e.g. high-contrast)", () => {
    const palette = fromTextMate({
      type: "hc-black",
      colors: { "editor.foreground": "#fff", "editor.background": "#000000" },
      tokenColors: [],
    });
    expect(palette.colorScheme).toBe("dark");
  });

  it("defaults name to 'custom-theme' when the theme has none", () => {
    const palette = fromTextMate({
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [],
    });
    expect(palette.name).toBe("custom-theme");
  });

  it("uses theme.name when present", () => {
    const palette = fromTextMate({
      name: "night-owl",
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [],
    });
    expect(palette.name).toBe("night-owl");
  });

  it("returns a plain, serializable ThemePalette", () => {
    const palette = fromTextMate({
      name: "night-owl",
      colors: { "editor.foreground": "#eee", "editor.background": "#111" },
      tokenColors: [{ scope: "keyword", settings: { foreground: "#f0f" } }],
    });
    expect(() => JSON.stringify(palette)).not.toThrow();
    expect(JSON.parse(JSON.stringify(palette))).toEqual(palette);
  });
});
