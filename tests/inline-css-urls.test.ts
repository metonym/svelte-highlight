import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { inlineCssUrls, mimeFromExt } from "../scripts/utils/inline-css-urls";

describe("mimeFromExt", () => {
  it("returns mime type for known extensions", () => {
    expect(mimeFromExt(".png")).toBe("image/png");
    expect(mimeFromExt(".jpg")).toBe("image/jpeg");
    expect(mimeFromExt(".JPEG")).toBe("image/jpeg");
  });

  it("throws for unknown extensions", () => {
    expect(() => mimeFromExt(".bmp")).toThrow("Unsupported image extension");
  });
});

describe("inlineCssUrls", () => {
  let fixtureDir: string;

  beforeEach(async () => {
    fixtureDir = await mkdtemp(path.join(tmpdir(), "inline-css-urls-"));
  });

  afterEach(async () => {
    await rm(fixtureDir, { recursive: true, force: true });
  });

  it("passes through CSS without relative URLs", async () => {
    const css = ".hljs { color: red; }";
    expect(await inlineCssUrls(css, fixtureDir)).toBe(css);
  });

  it("inlines relative url(./...) references as data URLs", async () => {
    const pngBytes = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    await writeFile(path.join(fixtureDir, "fixture.png"), pngBytes);

    const css = ".hljs { background: url(./fixture.png); }";
    const result = await inlineCssUrls(css, fixtureDir);

    expect(result).not.toContain("url(./fixture.png)");
    expect(result).toContain("url(data:image/png;base64,");
    expect(result).toContain(pngBytes.toString("base64"));
  });

  it("throws when a referenced asset is missing", async () => {
    const css = ".hljs { background: url(./missing.png); }";
    await expect(inlineCssUrls(css, fixtureDir)).rejects.toThrow(
      "CSS references missing asset",
    );
  });
});
