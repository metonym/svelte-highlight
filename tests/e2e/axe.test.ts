import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/experimental-ct-svelte";
// The component-test runner and `@axe-core/playwright` resolve different
// `playwright-core` versions, so their `Page` types differ even though
// both wrap the same runtime object.
import type { Page } from "playwright-core";
import A11y from "./A11y.test.svelte";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Contrast inside highlighted code depends on the hljs theme the consumer
// picks, which this library doesn't ship as part of the components.
const DISABLED_RULES = ["color-contrast"];

async function violations(page: unknown) {
  const results = await new AxeBuilder({ page: page as Page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();
  return results.violations.map((v) => ({
    id: v.id,
    help: v.help,
    targets: v.nodes.map((n) => n.target.join(" ")),
  }));
}

const CASES = [
  ["highlight", "Highlight, HighlightAuto, HighlightSvelte"],
  ["line-numbers", "LineNumbers"],
  ["virtual", "HighlightVirtual"],
  ["ansi", "AnsiOutput in CodeWindow"],
  ["code-window", "CodeWindow variants"],
  ["copy-button", "CopyButton"],
  ["editable", "HighlightEditable"],
  ["typewriter", "Typewriter"],
  ["stream", "HighlightStream"],
  ["stream-virtual", "HighlightStream virtualized"],
  ["markdown-stream", "MarkdownStream"],
  ["diff", "HighlightDiff unified"],
  ["diff-split", "HighlightDiff split"],
  ["diff-review", "HighlightDiff review"],
  ["diff-streaming", "HighlightDiff streaming"],
  ["diff-parts", "DiffView, DiffMinimap, DiffStats"],
  ["diff-file-list", "DiffFileList"],
  ["file-tabs", "FileTabs"],
] as const;

for (const [component, name] of CASES) {
  test(`Axe - ${name} has no WCAG 2.1 AA violations`, async ({
    mount,
    page,
  }) => {
    await mount(A11y, { props: { component } });
    await page.locator("main").waitFor();
    expect(await violations(page)).toEqual([]);
  });
}

test("A11y - code regions take keyboard focus and have names", async ({
  mount,
  page,
}) => {
  await mount(A11y, { props: { component: "highlight" } });
  await page.locator("main").waitFor();

  const regions = page.getByRole("region");
  await expect(regions).toHaveCount(4);
  await expect(page.getByRole("region", { name: "Code" })).toHaveCount(3);
  await expect(page.getByRole("region", { name: "Add function" })).toHaveCount(
    1,
  );

  await page.keyboard.press("Tab");
  await expect(regions.first()).toBeFocused();
});

test("A11y - CodeWindow names the region inside it, title first", async ({
  mount,
  page,
}) => {
  await mount(A11y, { props: { component: "code-window" } });
  await page.locator("main").waitFor();

  await expect(page.getByRole("region", { name: "example.ts" })).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Plain example" })).toHaveCount(
    1,
  );
  // No title and no label: the block keeps its own default.
  await expect(page.getByRole("region", { name: "Code" })).toHaveCount(1);
});

test("A11y - CopyButton announces success and failure", async ({
  mount,
  page,
}) => {
  await mount(A11y, { props: { component: "copy-button" } });
  await page.locator("main").waitFor();

  const status = page.getByRole("status");
  await expect(status).toHaveCount(2);
  await expect(status.nth(0)).toHaveText("");
  await expect(status.nth(1)).toHaveText("");

  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(status.nth(0)).toHaveText("Copied!");

  await page.getByRole("button", { name: "Copy, fails" }).click();
  await expect(status.nth(1)).toHaveText("Copy failed");
});

test("A11y - HighlightEditable is a named multiline textbox", async ({
  mount,
  page,
}) => {
  await mount(A11y, { props: { component: "editable" } });
  await page.locator("main").waitFor();

  const named = page.getByRole("textbox", {
    name: "Editable TypeScript example",
  });
  await expect(named).toHaveAttribute("aria-multiline", "true");
  await expect(named).not.toHaveAttribute("aria-readonly");

  const fallback = page.getByRole("textbox", { name: "Code editor" });
  await expect(fallback).toHaveAttribute("aria-readonly", "true");
});

test("A11y - Typewriter exposes the full text and hides the animation", async ({
  mount,
  page,
}) => {
  await mount(A11y, { props: { component: "typewriter" } });
  await page.locator("main").waitFor();

  const region = page.getByRole("region", { name: "Code" });
  await expect(region).toBeVisible();
  // `speed={1}` keeps the animation running for the whole test, but the
  // hidden copy already holds every character.
  await expect(region.locator(".typewriter-visually-hidden")).toHaveText(
    /^const values = \[0, 1, 2,.*\nconst add = \(a: number, b: number\) => a \+ b;\n$/s,
  );
  await expect(region.locator("> span[aria-hidden='true']")).toHaveCount(1);
});

for (const component of ["stream", "markdown-stream"] as const) {
  test(`Axe - ${component} has no violations once done`, async ({
    mount,
    page,
  }) => {
    await mount(A11y, { props: { component, done: true } });
    await page.locator("main").waitFor();
    expect(await violations(page)).toEqual([]);
  });
}
