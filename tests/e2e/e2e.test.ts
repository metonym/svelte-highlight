import { expect, test } from "@playwright/experimental-ct-svelte";
import Highlight from "./Highlight.test.svelte";
import HighlightAutoLanguageRestriction from "./HighlightAuto.languageRestriction.test.svelte";
import HighlightAuto from "./HighlightAuto.test.svelte";
import LangTag from "./LangTag.test.svelte";
import LineNumbersCssVariables from "./LineNumbers.cssVariables.test.svelte";
import LineNumbersCustomStartingLine from "./LineNumbers.customStartingLine.test.svelte";
import LineNumbersFocusLines from "./LineNumbers.focusLines.test.svelte";
import LineNumbersHideBorder from "./LineNumbers.hideBorder.test.svelte";
import LineNumbersLangtag from "./LineNumbers.langtag.test.svelte";
import LineNumbers from "./LineNumbers.test.svelte";
import LineNumbersWrapLines from "./LineNumbers.wrapLines.test.svelte";
import ScopedStyle from "./ScopedStyle.test.svelte";
import SvelteHighlight from "./SvelteHighlight.test.svelte";

test.use({ viewport: { width: 1200, height: 600 } });

test("Scoped styles - two themes coexist without bleed", async ({
  mount,
  page,
}) => {
  await mount(ScopedStyle);

  const keywordA = page.locator(".theme-a .hljs-keyword").first();
  const keywordB = page.locator(".theme-b .hljs-keyword").first();

  await expect(keywordA).toHaveText("const");
  await expect(keywordB).toHaveText("const");

  // a11y-dark keyword is #dcc6e0; github keyword is #d73a49.
  await expect(keywordA).toHaveCSS("color", "rgb(220, 198, 224)");
  await expect(keywordB).toHaveCSS("color", "rgb(215, 58, 73)");
});

test("Highlight", async ({ mount, page }) => {
  await mount(Highlight);
  await expect(page.locator("pre")).toHaveAttribute(
    "data-language",
    "typescript",
  );
  await expect(page.locator(".hljs-title")).toHaveText("add");
  await page.getByRole("button", { name: "Toggle", exact: true }).click();
  await expect(page.locator(".hljs-title")).toHaveText("hello");
});

test("Highlight - html language", async ({ mount, page }) => {
  await mount(Highlight);
  await page.getByRole("button", { name: "Toggle HTML" }).click();
  await expect(page.locator("pre")).toHaveAttribute("data-language", "html");
  await expect(page.locator(".language-css .hljs-selector-id")).toHaveText(
    "#content",
  );
  await expect(page.locator(".language-javascript .hljs-keyword")).toHaveText(
    "const",
  );
});

test("Highlight - astro language", async ({ mount, page }) => {
  await mount(Highlight);
  await page.getByRole("button", { name: "Toggle Astro" }).click();
  await expect(page.locator("pre")).toHaveAttribute("data-language", "astro");
  await expect(
    page.locator(".language-typescript .hljs-keyword").first(),
  ).toHaveText("export");
  await expect(page.locator(".hljs-attr")).toHaveText("client:load");
});

test("HighlightAuto", async ({ mount, page }) => {
  await mount(HighlightAuto);

  await expect(page.locator(".hljs-selector-tag")).toHaveText("body");
  await expect(page.locator(".hljs-attribute")).toHaveText("background");
  await expect(page.locator(".hljs-number")).toHaveText("#000");

  // Language tag
  await expect(page.locator("pre")).toHaveAttribute("data-language", "css");
});

test("SvelteHighlight", async ({ mount, page }) => {
  await mount(SvelteHighlight);
  await expect(page.locator("pre")).toHaveAttribute("data-language", "svelte");
  await expect(page.locator(".hljs-variable").first()).toHaveText("on:");
  await expect(page.locator(".language-typescript")).toBeVisible();
  await expect(page.locator(".hljs-variable.language_")).toHaveText("console");
});

test("LineNumbers - basic functionality", async ({ mount, page }) => {
  await mount(LineNumbers);
  await expect(page.getByText("1")).toBeVisible();

  await expect(page.locator(".hljs-keyword")).toHaveText("const");
  await expect(page.locator(".hljs-title")).toHaveText("add");

  const lineNumbersColumn = page.locator("td.hljs").first();
  await expect(lineNumbersColumn).toHaveCSS("position", "sticky");
  await expect(lineNumbersColumn).not.toHaveClass(/hideBorder/);
});

test("LineNumbers - hide border", async ({ mount, page }) => {
  await mount(LineNumbersHideBorder);

  const lineNumbersColumn = page.locator("td.hljs").first();
  await expect(lineNumbersColumn).toHaveClass(/hideBorder/);
});

test("LineNumbers - wrap lines", async ({ mount, page }) => {
  await mount(LineNumbersWrapLines);

  const preElement = page.locator("pre.wrapLines");
  await expect(preElement).toBeVisible();
});

test("LineNumbers - custom starting number", async ({ mount, page }) => {
  await mount(LineNumbersCustomStartingLine);

  await expect(page.getByText("100")).toBeVisible();
});

test("LineNumbers - langtag", async ({ mount, page }) => {
  await mount(LineNumbersLangtag);

  await expect(page.locator("div.langtag")).toBeVisible();
  await expect(page.locator("div.langtag")).toHaveAttribute(
    "data-language",
    "typescript",
  );
  await expect(page.locator("div.langtag")).toHaveCSS("position", "relative");
  await expect(page.locator(".hljs-keyword")).toHaveText("const");
});

test("LineNumbers - CSS variables override container styles without !important", async ({
  mount,
  page,
}) => {
  await mount(LineNumbersCssVariables);

  const container = page.locator("div[data-language]");
  await expect(container).toBeVisible();

  // --border-radius is applied to the outer container
  await expect(container).toHaveCSS("border-top-left-radius", "12px");
  await expect(container).toHaveCSS("border-bottom-right-radius", "12px");

  // --overflow-x overrides the hard-coded "auto" default (resolves #280)
  await expect(container).toHaveCSS("overflow-x", "hidden");

  // --max-width is applied to the outer container
  await expect(container).toHaveCSS("max-width", "320px");
});

test("LineNumbers - focus lines dim/blur un-highlighted lines", async ({
  mount,
  page,
}) => {
  await mount(LineNumbersFocusLines);

  const rows = page.locator("tr");

  // The highlighted line (index 1) is not dimmed.
  await expect(rows.nth(1)).not.toHaveClass(/dimmed/);

  // The remaining lines are dimmed and receive the opacity/filter effect.
  await expect(rows.nth(0)).toHaveClass(/dimmed/);
  await expect(rows.nth(2)).toHaveClass(/dimmed/);

  const dimmedCode = rows.nth(0).locator("pre");
  await expect(dimmedCode).toHaveCSS("opacity", "0.4");
  await expect(dimmedCode).toHaveCSS("filter", "blur(2px)");
});

test("Language tag styling", async ({ mount, page }) => {
  await mount(Highlight, {
    props: {
      langtag: true,
      code: "const x = 1;",
      language: { name: "javascript", register: () => {} },
      style: "--langtag-background: red; --langtag-color: white;",
    },
  });

  const langTag = page.locator("[data-language]");
  await expect(langTag).toBeVisible();
  // Could add more specific style checks if needed
});

test("Auto-highlighting detects language", async ({ mount, page }) => {
  await mount(HighlightAuto, {
    props: {
      code: "body { color: red; }",
    },
  });

  // Should detect CSS and apply appropriate highlighting
  await expect(page.locator(".hljs-selector-tag")).toBeVisible();
  await expect(page.locator("pre")).toHaveAttribute("data-language", "css");
});

test("Auto-highlighting with language restriction", async ({ mount, page }) => {
  await mount(HighlightAutoLanguageRestriction);

  // Should detect as javascript since we restricted to ["javascript", "typescript"]
  await expect(page.locator("pre")).toHaveAttribute(
    "data-language",
    "javascript",
  );

  // Should have JavaScript highlighting
  await expect(page.locator(".hljs-keyword")).toBeVisible();
  await expect(page.locator(".hljs-number")).toHaveText("42");
});

test("LangTag", async ({ mount, page }) => {
  await mount(LangTag);

  await expect(page.locator("pre.langtag")).toBeVisible();
  await expect(page.locator("pre")).toHaveAttribute(
    "data-language",
    "typescript",
  );
  await expect(page.locator(".hljs-keyword")).toHaveText("const");
  await expect(page.locator(".hljs-title")).toHaveText("add");

  const preElement = page.locator("pre.langtag");
  await expect(preElement).toHaveCSS("position", "relative");
});
