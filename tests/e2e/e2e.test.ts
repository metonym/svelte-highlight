import { expect, test } from "@playwright/experimental-ct-svelte";
import AnsiOutputContrast from "./AnsiOutput.contrast.test.svelte";
import AnsiOutputLink from "./AnsiOutput.link.test.svelte";
import AnsiOutput from "./AnsiOutput.test.svelte";
import CodeWindow from "./CodeWindow.test.svelte";
import CopyButtonAsyncCopy from "./CopyButton.asyncCopy.test.svelte";
import CopyButtonCustomCopy from "./CopyButton.customCopy.test.svelte";
import CopyButton from "./CopyButton.test.svelte";
import CopyButtonTransform from "./CopyButton.transform.test.svelte";
import FileTabs from "./FileTabs.test.svelte";
import Highlight from "./Highlight.test.svelte";
import HighlightActionOmittedCode from "./HighlightAction.omittedCode.test.svelte";
import HighlightActionRegisterThrows from "./HighlightAction.registerThrows.test.svelte";
import HighlightAction from "./HighlightAction.test.svelte";
import HighlightAutoLanguageRestriction from "./HighlightAuto.languageRestriction.test.svelte";
import HighlightAuto from "./HighlightAuto.test.svelte";
import HighlightEditableBinding from "./HighlightEditable.binding.test.svelte";
import HighlightEditableCssHighlights from "./HighlightEditable.cssHighlights.test.svelte";
import HighlightEditableLanguageSwap from "./HighlightEditable.languageSwap.test.svelte";
import HighlightEditable from "./HighlightEditable.test.svelte";
import HighlightStreamStability from "./HighlightStream.stability.test.svelte";
import HighlightStreamTemplateLiteral from "./HighlightStream.templateLiteral.test.svelte";
import HighlightStream from "./HighlightStream.test.svelte";
import HighlightStyleDedupe from "./HighlightStyle.dedupe.test.svelte";
import HighlightStyleNoTheme from "./HighlightStyle.noTheme.test.svelte";
import HighlightStyleThemeSwitch from "./HighlightStyle.themeSwitch.test.svelte";
import LangTag from "./LangTag.test.svelte";
import LineNumbersCssVariables from "./LineNumbers.cssVariables.test.svelte";
import LineNumbersCustomStartingLine from "./LineNumbers.customStartingLine.test.svelte";
import LineNumbersFocusLines from "./LineNumbers.focusLines.test.svelte";
import LineNumbersGutterOverflow from "./LineNumbers.gutterOverflow.test.svelte";
import LineNumbersHideBorder from "./LineNumbers.hideBorder.test.svelte";
import LineNumbersLangtag from "./LineNumbers.langtag.test.svelte";
import LineNumbersMultilineSpan from "./LineNumbers.multilineSpan.test.svelte";
import LineNumbers from "./LineNumbers.test.svelte";
import LineNumbersWrapLines from "./LineNumbers.wrapLines.test.svelte";
import ScopedStyle from "./ScopedStyle.test.svelte";
import SvelteHighlight from "./SvelteHighlight.test.svelte";
import Typewriter from "./Typewriter.test.svelte";

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

test("HighlightStyle - recomputes scope class when theme changes at runtime", async ({
  mount,
  page,
}) => {
  await mount(HighlightStyleThemeSwitch);

  const scopeA = await page.getByTestId("a-scope").textContent();
  const scopeBeforeSwitch = await page.getByTestId("b-scope").textContent();
  expect(scopeA).toBe(scopeBeforeSwitch);

  await page.getByTestId("switch-theme").click();

  const scopeAfterSwitch = await page.getByTestId("b-scope").textContent();
  expect(scopeAfterSwitch).not.toBe(scopeA);

  const a = page.getByTestId("a").locator(".hljs").first();
  const b = page.getByTestId("b").locator(".hljs").first();

  // a11y-dark background is #2b2b2b; github background is #ffffff.
  await expect(a).toHaveCSS("background-color", "rgb(43, 43, 43)");
  await expect(b).toHaveCSS("background-color", "rgb(255, 255, 255)");
});

test("HighlightStyle - dedupes head injection for instances sharing a theme", async ({
  mount,
  page,
}) => {
  const component = await mount(HighlightStyleDedupe);

  await expect(page.locator("style")).toHaveCount(1);

  await component.unmount();

  await expect(page.locator("style")).toHaveCount(0);
});

test("HighlightStyle - renders nothing when no theme is provided", async ({
  mount,
  page,
}) => {
  await mount(HighlightStyleNoTheme);

  const headText = await page
    .locator("head")
    .evaluate((head) => head.textContent ?? "");
  expect(headText).not.toContain("undefined");
  await expect(page.locator("style")).toHaveCount(0);
});

test("CodeWindow - renders each variant wrapping a Highlight", async ({
  mount,
  page,
}) => {
  await mount(CodeWindow);

  const macos = page.getByTestId("macos");
  const terminal = page.getByTestId("terminal");
  const plain = page.getByTestId("plain");

  // The slotted code block is rendered inside each window.
  await expect(macos.locator(".hljs-title")).toHaveText("add");
  await expect(terminal.locator(".hljs-title")).toHaveText("add");
  await expect(plain.locator(".hljs-title")).toHaveText("add");

  // Titles are shown in every variant's title bar.
  await expect(macos.locator(".title")).toHaveText("example.ts");
  await expect(terminal.locator(".title")).toHaveText("bash");
  await expect(plain.locator(".title")).toHaveText("plain.ts");

  // macOS shows three traffic-light dots; other variants do not.
  await expect(macos.locator(".dot")).toHaveCount(3);
  await expect(terminal.locator(".dot")).toHaveCount(0);
  await expect(plain.locator(".dot")).toHaveCount(0);

  // Terminal shows a prompt; macOS and plain do not.
  await expect(terminal.locator(".prompt")).toBeVisible();
  await expect(macos.locator(".prompt")).toHaveCount(0);
  await expect(plain.locator(".prompt")).toHaveCount(0);
});

test("AnsiOutput - renders styled spans inside a terminal window", async ({
  mount,
  page,
}) => {
  await mount(AnsiOutput);

  const ansi = page.getByTestId("ansi");
  await expect(ansi).toBeVisible();

  // Bold + green prompt: the "$" run is bold and green.
  const prompt = ansi.locator("span.bold").first();
  await expect(prompt).toHaveText("$");
  // a11y default green is #00cd00.
  await expect(prompt).toHaveCSS("color", "rgb(0, 205, 0)");

  // The "error" run is red and the "warning" run is yellow.
  const error = ansi.getByText("error", { exact: true });
  await expect(error).toHaveCSS("color", "rgb(205, 0, 0)");
  const warning = ansi.getByText("warning", { exact: true });
  await expect(warning).toHaveCSS("color", "rgb(205, 205, 0)");

  // The "done" run uses a bright blue (94 -> bright-blue #5c5cff).
  const done = ansi.getByText("done", { exact: true });
  await expect(done).toHaveCSS("color", "rgb(92, 92, 255)");

  // The reset after "$" drops bold/color: " npm run build" is unstyled text.
  await expect(ansi).toContainText("npm run build");

  // It pairs with the terminal CodeWindow chrome.
  await expect(page.getByTestId("window").locator(".prompt")).toBeVisible();
});

test("AnsiOutput - auto-contrast keeps low-contrast spans readable", async ({
  mount,
  page,
}) => {
  await mount(AnsiOutputContrast);

  const auto = page.getByTestId("auto");

  // White text on a white background flips to black.
  await expect(auto.getByText("WW")).toHaveCSS("color", "rgb(0, 0, 0)");
  // A white background with the default foreground also flips to black.
  await expect(auto.getByText("BG")).toHaveCSS("color", "rgb(0, 0, 0)");
  // White on blue already contrasts, so it stays white (#e5e5e5).
  await expect(auto.getByText("BL")).toHaveCSS("color", "rgb(229, 229, 229)");

  // With autoContrast disabled, the white-on-white text is left untouched.
  await expect(page.getByTestId("off").getByText("WW")).toHaveCSS(
    "color",
    "rgb(229, 229, 229)",
  );
});

test("AnsiOutput - OSC 8 hyperlink renders as an anchor", async ({
  mount,
  page,
}) => {
  await mount(AnsiOutputLink);

  const link = page.getByTestId("ansi").locator("a");
  await expect(link).toHaveText("docs");
  await expect(link).toHaveAttribute("href", "https://example.com");
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

test("highlight action", async ({ mount, page }) => {
  await mount(HighlightAction);

  // The action highlights the element's contents in place.
  const code = page.locator("pre code.hljs");
  await expect(code).toBeVisible();
  await expect(code.locator(".hljs-keyword").first()).toHaveText("const");
  await expect(code.locator(".hljs-title").first()).toHaveText("add");

  // Updating `code` re-highlights in place.
  await page.getByRole("button", { name: "Update" }).click();
  await expect(code.locator(".hljs-keyword").first()).toHaveText("function");
  await expect(code.locator(".hljs-title").first()).toHaveText("hello");
});

test("highlight action - idempotent when `code` is omitted", async ({
  mount,
  page,
}) => {
  await mount(HighlightActionOmittedCode);

  const code = page.locator("pre code.hljs");
  await expect(code).toBeVisible();
  await expect(code.locator(".hljs-keyword").first()).toHaveText("const");

  // Simulate the element's `textContent` drifting away from the original
  // source, e.g. because a previous highlight pass (or unrelated DOM edit)
  // already ran.
  await code.evaluate((el) => {
    el.textContent = "not the original source";
  });

  // Updating without `code` should re-highlight the snapshot captured on
  // init, not the element's current (mutated) `textContent`.
  const button = page.getByRole("button", { name: "Update" });
  await button.click();
  await expect(code).toHaveText("const s = 1;");
  await expect(code.locator(".hljs-keyword").first()).toHaveText("const");

  await button.click();
  await expect(code).toHaveText("const s = 1;");
});

test("highlight action - grammar errors don't escape and leave content unchanged", async ({
  mount,
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await mount(HighlightActionRegisterThrows);

  const code = page.locator("pre code");
  await expect(code).toHaveText("");
  await expect(code).not.toHaveClass(/hljs/);
  expect(errors).toEqual([]);
});

test("highlight action - destroy restores the original content", async ({
  mount,
  page,
}) => {
  const component = await mount(HighlightActionOmittedCode);

  const code = page.locator("pre code.hljs");
  await expect(code.locator(".hljs-keyword").first()).toHaveText("const");
  // Grab a handle before unmounting: Svelte removes the element from the
  // DOM on unmount, so it won't be reachable via `page.locator` afterward.
  const handle = await code.elementHandle();

  await component.unmount();

  expect(await handle?.evaluate((el) => el.innerHTML)).toBe("const s = 1;");
  expect(await handle?.evaluate((el) => el.className)).toBe("");
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

test("LineNumbers - preserves a span across a multi-line block comment", async ({
  mount,
  page,
}) => {
  await mount(LineNumbersMultilineSpan);

  const rows = page.locator("tbody > tr");
  await expect(rows).toHaveCount(3);

  await Promise.all(
    [0, 1, 2].map((i) =>
      expect(rows.nth(i).locator("td:last-child .hljs-comment")).toBeVisible(),
    ),
  );
});

test("LineNumbers - sizes the gutter by the final rendered line number", async ({
  mount,
  page,
}) => {
  await mount(LineNumbersGutterOverflow);

  const gutterCells = page.locator("td.hljs");
  await expect(gutterCells.last()).toHaveText("1001");

  const overflows = await gutterCells
    .last()
    .evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(overflows).toBe(false);
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

test("CopyButton - copies via the native Clipboard API", async ({
  mount,
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Clipboard permissions are Chromium-only",
  );

  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  const component = await mount(CopyButton);

  const button = page.getByRole("button", { name: "Copy" });
  await expect(button).toBeVisible();
  await button.click();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe("const add = (a: number, b: number) => a + b;");

  // The "copied" state is reflected on the button, then reverts after the timeout.
  await expect(
    component.getByRole("button", { name: "Copied!" }),
  ).toBeVisible();
  await expect(component.getByRole("button", { name: "Copy" })).toBeVisible({
    timeout: 3_000,
  });
});

test("CopyButton - custom copy prop overrides the Clipboard API", async ({
  mount,
  page,
}) => {
  const component = await mount(CopyButtonCustomCopy);

  await expect(page.getByTestId("copied")).toHaveText("");
  const button = component.getByRole("button");
  await button.click();
  await expect(page.getByTestId("copied")).toHaveText(
    "const add = (a: number, b: number) => a + b;",
  );

  // CSS custom properties customize the button without !important.
  await expect(button).toHaveCSS("width", "60px");
  await expect(button).toHaveCSS("z-index", "5");
});

test("CopyButton - ignores duplicate clicks while in the copied state", async ({
  mount,
  page,
}) => {
  const component = await mount(CopyButtonCustomCopy);

  const button = component.getByRole("button");
  await button.click();

  // The "copied" icon is shown (aria-label reflects the copied state).
  await expect(button).toHaveAttribute("aria-label", "Copied!");
  await expect(page.getByTestId("count")).toHaveText("1");

  // Clicking again while copied must not fire another copy...
  await button.click();
  await expect(page.getByTestId("count")).toHaveText("1");
  // ...and the "copied" icon remains visible.
  await expect(button).toHaveAttribute("aria-label", "Copied!");

  // The state reverts after the configured timeout (1000ms here).
  await expect(button).toHaveAttribute("aria-label", "Copy", {
    timeout: 3_000,
  });
});

test("CopyButton - dedupes clicks while an async copy is in flight", async ({
  mount,
  page,
}) => {
  const component = await mount(CopyButtonAsyncCopy);

  const button = component.getByRole("button");
  await button.click();

  // The copy is in flight (slot exposes `copying`); clicking again is ignored.
  await expect(page.getByTestId("pending")).toBeVisible();
  await expect(page.getByTestId("count")).toHaveText("1");
  await button.click();
  await expect(page.getByTestId("count")).toHaveText("1");

  // Once it resolves, the "copied" state is shown, then reverts.
  await expect(button).toHaveAttribute("aria-label", "Copied!", {
    timeout: 3_000,
  });
  await expect(button).toHaveAttribute("aria-label", "Copy", {
    timeout: 3_000,
  });
});

test("CopyButton - transform strips decoration before copying and reporting on:copy", async ({
  mount,
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Clipboard permissions are Chromium-only",
  );

  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  const component = await mount(CopyButtonTransform);

  await component.getByRole("button").click();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe("npm i\nadded 1 package");
  await expect(page.getByTestId("detail")).toHaveText("npm i\nadded 1 package");
});

test("HighlightEditable - renders an editable, highlighted block", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable);

  await expect(page.locator("[contenteditable='true']")).toBeVisible();
  await expect(page.locator(".hljs-keyword").first()).toHaveText("const");
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "const a = 1;",
  );
  await expect(page.getByTestId("entries")).toHaveAttribute("data-value", "1");
  await expect(page.getByTestId("can-undo")).toHaveAttribute(
    "data-value",
    "false",
  );
});

test("HighlightEditable - repaints when the language prop changes without input", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditableLanguageSwap);

  // plaintext has no token spans for this code.
  await expect(page.locator(".hljs-keyword")).toHaveCount(0);

  await page.getByTestId("switch-language").click();

  // typescript's grammar highlights "const" without any input event firing.
  await expect(page.locator(".hljs-keyword").first()).toHaveText("const");
});

test("HighlightEditable - typing updates the bound code and fires change", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable);

  const editor = page.locator("[contenteditable='true']");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ArrowRight"); // collapse caret to end
  await page.keyboard.type(" // ok");

  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "const a = 1; // ok",
  );
  await expect(page.getByTestId("changes")).not.toHaveAttribute(
    "data-value",
    "0",
  );
});

test("HighlightEditable - preserves caret position across re-highlight", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable, { props: { initialCode: "abcd" } });

  const editor = page.locator("[contenteditable='true']");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ArrowLeft"); // collapse caret to start
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight"); // caret after "ab"
  await page.keyboard.type("XY");

  // Inserted at the caret (not at the start), proving the caret survives the
  // re-highlight that runs on each keystroke.
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "abXYcd",
  );
});

test("HighlightEditable - Enter inserts a newline and Tab inserts indent", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable, { props: { initialCode: "a" } });

  const editor = page.locator("[contenteditable='true']");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ArrowRight"); // caret to end
  await page.keyboard.press("Enter");
  await page.keyboard.type("b");
  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "a\nb");

  await page.keyboard.press("Tab");
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "a\nb  ",
  );
});

test("HighlightEditable - Tab and Shift+Tab indent/dedent selected lines", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable, { props: { initialCode: "a\nb" } });

  const editor = page.locator("[contenteditable='true']");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "  a\n  b",
  );

  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "a\nb");
});

test("HighlightEditable - undo and redo walk the history", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable);

  await page.getByTestId("insert").click();
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "const a = 1;X",
  );
  await expect(page.getByTestId("can-undo")).toHaveAttribute(
    "data-value",
    "true",
  );

  await page.getByTestId("undo").click();
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "const a = 1;",
  );
  await expect(page.getByTestId("can-redo")).toHaveAttribute(
    "data-value",
    "true",
  );

  await page.getByTestId("redo").click();
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "const a = 1;X",
  );
});

test("HighlightEditable - undo preserves caret position", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable, { props: { initialCode: "abcd" } });

  const editor = page.locator("[contenteditable='true']");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.type("XY");
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    "abXYcd",
  );

  await page.keyboard.press("ControlOrMeta+z");
  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "abcd");

  await page.keyboard.type("Q");
  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "abQcd");
});

test("HighlightEditable - native undo (execCommand) routes through the custom history", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable, { props: { initialCode: "ab" } });

  const editor = page.locator("[contenteditable='true']");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ArrowRight"); // collapse caret to end
  await page.keyboard.type("X");
  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "abX");

  // Wait past the 250ms typing-coalesce window so "Y" is its own history entry.
  await page.waitForTimeout(300);
  await page.keyboard.type("Y");
  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "abXY");

  // The Edit-menu / execCommand path fires beforeinput historyUndo, distinct
  // from the Ctrl/Cmd+Z keydown path already covered above.
  await editor.evaluate(() => document.execCommand("undo"));

  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "abX");
  await expect(page.getByTestId("can-undo")).toHaveAttribute(
    "data-value",
    "true",
  );
  await expect(page.getByTestId("can-redo")).toHaveAttribute(
    "data-value",
    "true",
  );
});

test("HighlightEditable - setCode and clear replace the document", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable);

  await page.getByTestId("set-code").click();
  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "xyz");
  await expect(page.getByTestId("can-undo")).toHaveAttribute(
    "data-value",
    "true",
  );

  await page.getByTestId("clear").click();
  await expect(page.getByTestId("code")).toHaveAttribute("data-value", "");
});

test("HighlightEditable - focus outline uses the --outline-color variable", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditable);

  const editor = page.locator("[contenteditable='true']");
  await editor.click();
  await expect(editor).toHaveCSS("outline-color", "rgb(255, 0, 0)");
});

test("HighlightEditable - only repaints the edited line, leaving others' DOM connected", async ({
  mount,
  page,
}) => {
  const lines = Array.from({ length: 20 }, (_, i) => `line ${i}`).join("\n");
  await mount(HighlightEditable, { props: { initialCode: lines } });

  const editor = page.locator("[contenteditable='true']");
  const firstLine = editor.locator("> span").first();
  const handle = await firstLine.elementHandle();

  // Click directly into the last line (rather than select-all + collapse)
  // so the caret lands inside that line's element.
  await editor.locator("> span").last().click();
  await page.keyboard.type("!");

  const code = await page.getByTestId("code").getAttribute("data-value");
  expect(code).toHaveLength(lines.length + 1);
  // Line 0's element survives the edit: only the last line's DOM was
  // touched, proving the repaint didn't rebuild the whole document.
  expect(await handle?.evaluate((el) => el.isConnected)).toBe(true);
});

test("HighlightEditable - handles bursts of typing on a large document within budget", async ({
  mount,
  page,
}) => {
  test.slow();
  const lines = Array.from({ length: 2000 }, (_, i) => `line ${i}`).join("\n");
  await mount(HighlightEditable, { props: { initialCode: lines } });

  const editor = page.locator("[contenteditable='true']");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ArrowRight"); // collapse caret to the end

  // Dispatched in-page (not via Playwright's per-key round trip) so the
  // measurement reflects our own repaint/caret-restore cost, not IPC
  // overhead. This is a coarse smoke check, not a tight perf budget: it
  // catches an O(document) regression (e.g. a full innerHTML rebuild) for a
  // 2,000-line document without being flaky on ordinary keystroke cost.
  const elapsed = await editor.evaluate(() => {
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      document.execCommand("insertText", false, "x");
    }
    return performance.now() - start;
  });

  expect(elapsed).toBeLessThan(5000);
  await expect(page.getByTestId("code")).toHaveAttribute(
    "data-value",
    `${lines}${"x".repeat(50)}`,
  );
});

test("HighlightEditable css-highlights engine - paints tokens with no nested per-token spans", async ({
  mount,
  page,
}) => {
  const supported = await page.evaluate(
    () => typeof CSS !== "undefined" && "highlights" in CSS,
  );
  test.skip(!supported, "CSS Custom Highlight API not supported");

  await mount(HighlightEditableCssHighlights);

  await expect(page.getByTestId("resolved-engine")).toHaveAttribute(
    "data-value",
    "css-highlights",
  );

  const editor = page.locator("[contenteditable='true']");
  // One <span> per line (reused from the DOM engine's line structure), but
  // no nested per-token spans: tokens are painted as CSS.highlights ranges.
  await expect(editor.locator("> span")).toHaveCount(1);
  await expect(editor.locator("span span")).toHaveCount(0);

  const keywordPainted = await page.evaluate(() => {
    const name = [...CSS.highlights.keys()].find((key) =>
      key.endsWith("-keyword"),
    );
    const highlight = name && CSS.highlights.get(name);
    return highlight ? [...highlight].length > 0 : false;
  });
  expect(keywordPainted).toBe(true);
});

test("HighlightEditable css-highlights engine - unrelated lines stay connected across edits", async ({
  mount,
  page,
}) => {
  const supported = await page.evaluate(
    () => typeof CSS !== "undefined" && "highlights" in CSS,
  );
  test.skip(!supported, "CSS Custom Highlight API not supported");

  const lines = Array.from({ length: 5 }, (_, i) => `line ${i}`).join("\n");
  await mount(HighlightEditableCssHighlights, {
    props: { initialCode: lines },
  });

  const editor = page.locator("[contenteditable='true']");
  const firstLine = editor.locator("> span").first();
  const handle = await firstLine.elementHandle();

  // Click (rather than press End, whose landing offset differs across
  // browsers for this structure) and type from wherever the click lands --
  // the assertion below only cares that the edit was recorded and that
  // unrelated lines were never touched, not the exact caret offset.
  await editor.locator("> span").last().click();
  await page.keyboard.type("x".repeat(20));

  const code = await page.getByTestId("code").getAttribute("data-value");
  expect(code).toHaveLength(lines.length + 20);
  expect(await handle?.evaluate((el) => el.isConnected)).toBe(true);
});

test("HighlightEditable css-highlights engine - falls back to the DOM engine without CSS.highlights", async ({
  mount,
  page,
}) => {
  // No page navigation happens between CT mounts, so deleting the API
  // directly (rather than via an init script, which only fires on
  // navigation) is what actually takes effect before the component reads it.
  await page.evaluate(() => {
    Reflect.deleteProperty(CSS, "highlights");
  });

  await mount(HighlightEditableCssHighlights);

  await expect(page.getByTestId("resolved-engine")).toHaveAttribute(
    "data-value",
    "dom",
  );
  await expect(page.locator(".hljs-keyword").first()).toHaveText("const");
});

test("HighlightStream - streaming chunks (split mid-keyword and mid-template-literal) settle to Highlight's output", async ({
  mount,
  page,
}) => {
  await mount(HighlightStream);

  const appendChunk = page.getByTestId("append-chunk");
  const highlightCount = page.getByTestId("highlight-count");

  // Each chunk must trigger at least one `on:highlight`, even though bursts
  // within a single frame coalesce into fewer highlight passes.
  let previousCount = (await highlightCount.textContent()) ?? "0";
  for (let sent = 1; sent <= 5; sent++) {
    // biome-ignore lint/performance/noAwaitInLoops: each chunk's effect on-screen must be observed before the next chunk is sent
    await appendChunk.click();
    await expect(highlightCount).not.toHaveText(previousCount);
    previousCount = (await highlightCount.textContent()) ?? previousCount;
  }

  await page.getByTestId("finish").click();

  const stream = page.getByTestId("stream").locator("code");
  const reference = page.getByTestId("reference").locator("code");
  await expect(stream).toHaveText("const greet = () => `Hello, world!`;");
  expect(await stream.innerHTML()).toBe(await reference.innerHTML());
});

test("HighlightStream - stable line elements are not recreated as more lines stream in", async ({
  mount,
  page,
}) => {
  await mount(HighlightStreamStability);

  const firstLine = page
    .getByTestId("stream")
    .locator("[data-line='0']")
    .first();
  await expect(firstLine).toBeVisible();
  const handle = await firstLine.elementHandle();

  await page.getByTestId("append-lines").click();
  await expect(page.getByTestId("stream").locator("[data-line]")).toHaveCount(
    51,
  );

  expect(await handle?.evaluate((el) => el.isConnected)).toBe(true);
});

test("HighlightStream - closing a multi-line template literal re-tokenizes the earlier line", async ({
  mount,
  page,
}) => {
  await mount(HighlightStreamTemplateLiteral);

  const secondLine = page.getByTestId("stream").locator("[data-line='1']");
  await expect(secondLine).toHaveText("line two");
  await expect(secondLine.locator(".hljs-string")).toHaveText("line two");

  await page.getByTestId("close-template-literal").click();

  await expect(secondLine).toHaveText("line two done`;");
  await expect(secondLine.locator(".hljs-string")).toHaveText("line two done`");
});

test("HighlightStream - `done` hides the caret and fires on:done", async ({
  mount,
  page,
}) => {
  await mount(HighlightStream);

  const stream = page.getByTestId("stream");
  await page.getByTestId("append-chunk").click();
  await expect(stream.locator(".highlight-stream-caret")).toBeVisible();
  await expect(page.getByTestId("done-count")).toHaveText("0");

  await page.getByTestId("finish").click();
  await expect(stream.locator(".highlight-stream-caret")).toHaveCount(0);
  await expect(page.getByTestId("done-count")).toHaveText("1");
});

test("Typewriter - animates then settles to the full highlighted content", async ({
  mount,
  page,
}) => {
  await mount(Typewriter);

  const tw = page.getByTestId("tw");

  // Mid-animation, partial splits can duplicate open tags (e.g. `add` → `a` + `dd`).
  // Wait for `done` before asserting final highlighted structure.
  await expect(page.getByTestId("done")).toHaveText("1");

  await expect(tw.locator(".hljs-keyword").first()).toHaveText("const");
  await expect(tw.locator(".hljs-title.function_")).toHaveText("add");
  await expect(tw).toContainText(
    "const add = (a: number, b: number) => a + b;",
  );
});

test("Typewriter - reduced motion renders instantly", async ({
  mount,
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  // At speed 1000, typing would take ~44s without reduced motion. With reduced
  // motion the full content (and `done`) must appear immediately.
  await mount(Typewriter, { props: { speed: 1000 } });

  const tw = page.getByTestId("tw");
  await expect(page.getByTestId("done")).toHaveText("1");
  await expect(tw.locator(".hljs-title.function_")).toHaveText("add");
});

test("Typewriter - revealed DOM nodes stay connected across ticks (no per-tick rebuild)", async ({
  mount,
  page,
}) => {
  await mount(Typewriter, { props: { speed: 20 } });

  const tw = page.getByTestId("tw");
  const firstUnit = tw.locator(".typewriter-unit").first();
  await expect(firstUnit).toBeVisible();

  const handle = await firstUnit.elementHandle();
  // ~10 more ticks at 20ms each.
  await page.waitForTimeout(200);

  expect(await handle?.evaluate((el) => el.isConnected)).toBe(true);
});

test("Typewriter - pausing then resuming continues without restarting", async ({
  mount,
  page,
}) => {
  await mount(Typewriter, { props: { speed: 15 } });

  const tw = page.getByTestId("tw");
  const revealed = tw.locator(".typewriter-unit:not(.typewriter-hidden)");

  await page.waitForTimeout(120);
  await page.getByTestId("toggle-play").click(); // pause

  const pausedCount = await revealed.count();
  expect(pausedCount).toBeGreaterThan(0);
  const firstRevealed = await revealed.first().elementHandle();

  await page.waitForTimeout(150);
  // No progress while paused.
  expect(await revealed.count()).toBe(pausedCount);

  await page.getByTestId("toggle-play").click(); // resume
  await expect(page.getByTestId("done")).toHaveText("1");

  // Same DOM node from before the pause: resume picked up where it left
  // off instead of re-tokenizing/rebuilding.
  expect(await firstRevealed?.evaluate((el) => el.isConnected)).toBe(true);
});

test("Typewriter - swapping `highlighted` mid-animation restarts cleanly", async ({
  mount,
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await mount(Typewriter, { props: { speed: 15 } });

  const tw = page.getByTestId("tw");
  await page.waitForTimeout(120); // reveal some characters of the first snippet
  await page.getByTestId("swap-code").click();

  await expect(page.getByTestId("done")).toHaveText("1");
  await expect(tw.locator(".hljs-title.function_")).toHaveText("hello");
  await expect(tw).toContainText("function hello(name: string) {}");

  expect(errors).toEqual([]);
});

test("HighlightEditable - two instances share the same bound code", async ({
  mount,
  page,
}) => {
  await mount(HighlightEditableBinding);

  const second = page.getByTestId("second").locator("[contenteditable='true']");
  await expect(second).toHaveText("ab");

  await page.getByTestId("insert-first").click();
  await expect(second).toHaveText("abX");
});

test("FileTabs - renders a tab per file with the first active", async ({
  mount,
  page,
}) => {
  await mount(FileTabs);

  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(3);

  // The first file is active by default.
  await expect(page.getByRole("tab", { name: "App.svelte" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("active")).toHaveText("App.svelte");

  // The active file's code is shown in the panel.
  await expect(page.getByRole("tabpanel")).toContainText("const answer = 42;");
});

test("FileTabs - clicking a tab switches the active file and dispatches change", async ({
  mount,
  page,
}) => {
  await mount(FileTabs);

  await page.getByRole("tab", { name: "index.js" }).click();

  await expect(page.getByRole("tab", { name: "index.js" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tab", { name: "App.svelte" })).toHaveAttribute(
    "aria-selected",
    "false",
  );

  // The visual `active` class follows the selected tab.
  await expect(page.getByRole("tab", { name: "index.js" })).toHaveClass(
    /active/,
  );
  await expect(page.getByRole("tab", { name: "App.svelte" })).not.toHaveClass(
    /active/,
  );

  // The slot prop and the `change` event both reflect the new file.
  await expect(page.getByTestId("active")).toHaveText("index.js");
  await expect(page.getByTestId("last-change")).toHaveText("index.js");
  await expect(page.getByRole("tabpanel")).toContainText(
    "export default answer;",
  );
});

test("FileTabs - arrow keys move between tabs (roving tabindex)", async ({
  mount,
  page,
}) => {
  await mount(FileTabs);

  await page.getByRole("tab", { name: "App.svelte" }).focus();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "index.js" })).toBeFocused();
  await expect(page.getByTestId("active")).toHaveText("index.js");

  // Wraps from the last tab back to the first.
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "vite.config.js" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "App.svelte" })).toBeFocused();

  // ArrowLeft wraps the other way.
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "vite.config.js" })).toBeFocused();
  await expect(page.getByTestId("active")).toHaveText("vite.config.js");
});

test("FileTabs - active tab background matches the highlighted code theme", async ({
  mount,
  page,
}) => {
  await mount(FileTabs);

  // atom-one-dark paints `.hljs` rgb(40, 44, 52). The active tab should match.
  const codeBackground = await page
    .locator(".hljs")
    .first()
    .evaluate((node) => getComputedStyle(node).backgroundColor);

  await expect(page.getByRole("tab", { selected: true })).toHaveCSS(
    "background-color",
    codeBackground,
  );
});
