import { expect, test } from "@playwright/experimental-ct-svelte";
import Highlight from "./Highlight.test.svelte";
import HighlightAuto from "./HighlightAuto.test.svelte";
import SvelteHighlight from "./SvelteHighlight.test.svelte";

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
  await expect(page.locator("pre")).toHaveAttribute("data-language", "css");
});

test("SvelteHighlight", async ({ mount, page }) => {
  await mount(SvelteHighlight);
  await expect(page.locator(".hljs-attr")).toHaveText("on:click");
});
