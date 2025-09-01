import { expect, test } from "@playwright/experimental-ct-svelte";
import Highlight from "./Highlight.test.svelte";
import HighlightAuto from "./HighlightAuto.test.svelte";
import LineNumbersCustomStartingLine from "./LineNumbers.customStartingLine.test.svelte";
import LineNumbersHideBorder from "./LineNumbers.hideBorder.test.svelte";
import LineNumbers from "./LineNumbers.test.svelte";
import LineNumbersWrapLines from "./LineNumbers.wrapLines.test.svelte";
import SvelteHighlight from "./SvelteHighlight.test.svelte";
import CopyButton from "./CopyButton.test.svelte";

test.use({ viewport: { width: 1200, height: 600 } });

test("Highlight", async ({ mount, page }) => {
  await mount(Highlight);
  await expect(page.locator("pre")).toHaveAttribute(
    "data-language",
    "typescript",
  );
  await expect(page.locator(".hljs-title")).toHaveText("add");
  await page.click("button");
  await expect(page.locator(".hljs-title")).toHaveText("hello");
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
  await expect(page.locator(".hljs-attr")).toHaveText("on:click");
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

test("CopyButton - basic functionality", async ({ mount, page }) => {
  await mount(CopyButton);
  
  // Check that CopyButton is visible
  await expect(page.getByText("Copy")).toBeVisible();
  
  // Check that all test sections are present
  await expect(page.getByText("Basic CopyButton")).toBeVisible();
  await expect(page.getByText("Custom Text CopyButton")).toBeVisible();
  await expect(page.getByText("Custom Copy Function")).toBeVisible();
  await expect(page.getByText("CopyButton with Custom Styling")).toBeVisible();
  
  // Check that copy buttons are positioned correctly
  const copyButtons = page.locator("button");
  await expect(copyButtons).toHaveCount(4);
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
