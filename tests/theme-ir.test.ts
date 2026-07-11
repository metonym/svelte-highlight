import {
  canonicalizeProperty,
  classifySelector,
  colorSchemeFor,
  isSimpleColorValue,
  subjectScope,
  varName,
} from "../scripts/utils/theme-ir.ts";

describe("classifySelector", () => {
  it("classifies the base .hljs rule", () => {
    expect(classifySelector(".hljs")).toEqual({ kind: "base", scopes: [] });
  });

  it("classifies a single scope", () => {
    expect(classifySelector(".hljs-keyword")).toEqual({
      kind: "single",
      scopes: ["keyword"],
    });
  });

  it("classifies a two-part compound, keeping the trailing underscore", () => {
    expect(classifySelector(".hljs-title.class_")).toEqual({
      kind: "compound",
      scopes: ["title", "class_"],
    });
  });

  it("classifies a three-part compound", () => {
    expect(classifySelector(".hljs-title.class_.inherited__")).toEqual({
      kind: "compound",
      scopes: ["title", "class_", "inherited__"],
    });
  });

  it("classifies a compound where every part is hljs-prefixed", () => {
    expect(classifySelector(".hljs-keyword.hljs-atrule")).toEqual({
      kind: "compound",
      scopes: ["keyword", "atrule"],
    });
  });

  it("classifies a two-level descendant selector", () => {
    expect(classifySelector(".hljs-meta .hljs-keyword")).toEqual({
      kind: "descendant",
      scopes: ["meta", "keyword"],
    });
  });

  it("normalizes a newline combinator to a descendant selector", () => {
    expect(classifySelector(".hljs-code\n.hljs-selector-class")).toEqual({
      kind: "descendant",
      scopes: ["code", "selector-class"],
    });
  });

  it("treats a non-hljs-prefixed ancestor as unsupported", () => {
    expect(classifySelector(".ruby .hljs-keyword").kind).toBe("unsupported");
  });

  it("treats a three-level descendant as unsupported", () => {
    expect(classifySelector(".hljs-a .hljs-b .hljs-c").kind).toBe(
      "unsupported",
    );
  });

  it("treats a child combinator as unsupported", () => {
    expect(classifySelector(".hljs-a>.hljs-b").kind).toBe("unsupported");
  });

  it("treats pseudo-elements/classes as unsupported", () => {
    expect(classifySelector(".hljs::selection").kind).toBe("unsupported");
    expect(classifySelector(".hljs-keyword:hover").kind).toBe("unsupported");
  });
});

describe("subjectScope", () => {
  it("falls back a compound to its anchor (first) scope", () => {
    expect(
      subjectScope({ kind: "compound", scopes: ["title", "class_"] }),
    ).toEqual(["title"]);
  });

  it("falls back a descendant to its subject (last) scope", () => {
    expect(
      subjectScope({ kind: "descendant", scopes: ["meta", "keyword"] }),
    ).toEqual(["keyword"]);
  });

  it("returns null for base/single/unsupported shapes", () => {
    expect(subjectScope({ kind: "base", scopes: [] })).toBeNull();
    expect(subjectScope({ kind: "single", scopes: ["keyword"] })).toBeNull();
    expect(subjectScope({ kind: "unsupported", scopes: [] })).toBeNull();
  });
});

describe("varName", () => {
  it("names the base scope's fg/bg specially", () => {
    expect(varName([], "color")).toBe("--shl-fg");
    expect(varName([], "background-color")).toBe("--shl-bg");
  });

  it("names a single scope", () => {
    expect(varName(["keyword"], "color")).toBe("--shl-keyword");
    expect(varName(["keyword"], "background-color")).toBe("--shl-keyword-bg");
    expect(varName(["keyword"], "font-style")).toBe("--shl-keyword-font-style");
    expect(varName(["keyword"], "font-weight")).toBe(
      "--shl-keyword-font-weight",
    );
    expect(varName(["keyword"], "text-decoration")).toBe(
      "--shl-keyword-text-decoration",
    );
  });

  it("joins compound/descendant scopes with a dash", () => {
    expect(varName(["title", "class_"], "color")).toBe("--shl-title-class_");
    expect(varName(["meta", "keyword"], "color")).toBe("--shl-meta-keyword");
  });

  it("returns null for a property outside the var contract", () => {
    expect(varName(["keyword"], "opacity")).toBeNull();
    expect(varName([], "display")).toBeNull();
  });
});

describe("canonicalizeProperty", () => {
  it("normalizes background to background-color", () => {
    expect(canonicalizeProperty("background")).toBe("background-color");
    expect(canonicalizeProperty("Background")).toBe("background-color");
  });

  it("lowercases and passes through other properties", () => {
    expect(canonicalizeProperty("Color")).toBe("color");
    expect(canonicalizeProperty("background-color")).toBe("background-color");
  });
});

describe("isSimpleColorValue", () => {
  it("accepts hex, rgb/rgba, hsl/hsla, and bare keywords", () => {
    expect(isSimpleColorValue("#fff")).toBe(true);
    expect(isSimpleColorValue("#ffffff")).toBe(true);
    expect(isSimpleColorValue("#ffffff80")).toBe(true);
    expect(isSimpleColorValue("rgba(1,2,3,0.5)")).toBe(true);
    expect(isSimpleColorValue("hsl(1,2%,3%)")).toBe(true);
    expect(isSimpleColorValue("white")).toBe(true);
  });

  it("rejects gradients, images, and multi-token shorthands", () => {
    expect(isSimpleColorValue("linear-gradient(90deg, #fff, #000)")).toBe(
      false,
    );
    expect(isSimpleColorValue("url(foo.png) repeat scroll left top #fff")).toBe(
      false,
    );
  });
});

describe("colorSchemeFor", () => {
  it("infers light for bright backgrounds", () => {
    expect(colorSchemeFor("#ffffff")).toBe("light");
    expect(colorSchemeFor("white")).toBe("light");
  });

  it("infers dark for dim backgrounds", () => {
    expect(colorSchemeFor("#000000")).toBe("dark");
    expect(colorSchemeFor("#282c34")).toBe("dark");
  });

  it("defaults to light when unparseable/missing", () => {
    expect(colorSchemeFor(undefined)).toBe("light");
    expect(colorSchemeFor("url(foo.png)")).toBe("light");
  });
});
