import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/experimental-ct-svelte";
// `@playwright/experimental-ct-svelte` and `@axe-core/playwright` pin
// different `playwright-core` versions, so their `Page` types structurally
// diverge (newer, unused-here methods) even though both wrap the same
// runtime object.
import type { Page } from "playwright-core";
import AnsiOutput from "./AnsiOutput.test.svelte";
import CodeWindow from "./CodeWindow.test.svelte";
import CopyButton from "./CopyButton.test.svelte";
import FileTabs from "./FileTabs.test.svelte";
import HighlightRegion from "./Highlight.region.test.svelte";
import Highlight from "./Highlight.test.svelte";
import HighlightEditable from "./HighlightEditable.test.svelte";
import LineNumbers from "./LineNumbers.test.svelte";
import Typewriter from "./Typewriter.test.svelte";

test.use({ viewport: { width: 1200, height: 600 } });

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Color-contrast findings inside highlighted code depend on the user's
// chosen hljs theme, which this library doesn't control, so that rule is
// excluded from these scans.
const DISABLED_RULES = ["color-contrast"];

test("Axe - Highlight with a theme has no violations", async ({
  mount,
  page,
}) => {
  await mount(Highlight);
  const results = await new AxeBuilder({ page: page as unknown as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Axe - Highlight with LineNumbers has no violations", async ({
  mount,
  page,
}) => {
  await mount(LineNumbers);
  const results = await new AxeBuilder({ page: page as unknown as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Axe - CopyButton overlay has no violations", async ({ mount, page }) => {
  await mount(CopyButton);
  const results = await new AxeBuilder({ page: page as unknown as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Axe - CodeWindow with AnsiOutput has no violations", async ({
  mount,
  page,
}) => {
  await mount(AnsiOutput);
  const results = await new AxeBuilder({ page: page as unknown as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Axe - CodeWindow variants have no violations", async ({
  mount,
  page,
}) => {
  await mount(CodeWindow);
  const results = await new AxeBuilder({ page: page as unknown as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Axe - HighlightEditable has no violations", async ({ mount, page }) => {
  await mount(HighlightEditable);
  const results = await new AxeBuilder({ page: page as unknown as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Axe - FileTabs has no violations", async ({ mount, page }) => {
  await mount(FileTabs);
  const results = await new AxeBuilder({ page: page as unknown as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Axe - Typewriter has no violations", async ({ mount, page }) => {
  await mount(Typewriter);
  const results = await new AxeBuilder({ page: page as unknown as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Highlight - Tab reaches the code region and it has an accessible name", async ({
  mount,
  page,
}) => {
  await mount(HighlightRegion);

  await page.keyboard.press("Tab");

  const region = page.locator("pre");
  await expect(region).toBeFocused();
  await expect(region).toHaveAttribute("aria-label", "Code");
});

test("CopyButton - live region announces the copied state", async ({
  mount,
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Clipboard permissions are Chromium-only",
  );
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  await mount(CopyButton);
  await page.getByRole("button", { name: "Copy" }).click();

  await expect(page.getByRole("status")).toHaveText("Copied!");
});

test("HighlightEditable - exposes role=textbox with the provided label", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable);

  const textbox = page.getByRole("textbox", {
    name: "Editable TypeScript example",
  });
  await expect(textbox).toHaveAttribute("aria-multiline", "true");
});
