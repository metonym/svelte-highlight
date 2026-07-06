import { expect, test } from "@playwright/experimental-ct-svelte";
import AnsiOutputContrast from "./AnsiOutput.contrast.test.svelte";
import AnsiOutputLink from "./AnsiOutput.link.test.svelte";
import AnsiOutput from "./AnsiOutput.test.svelte";
import CodeWindow from "./CodeWindow.test.svelte";
import CopyButtonAsyncCopy from "./CopyButton.asyncCopy.test.svelte";
import CopyButtonCustomCopy from "./CopyButton.customCopy.test.svelte";
import CopyButton from "./CopyButton.test.svelte";
import FileTabs from "./FileTabs.test.svelte";
import Highlight from "./Highlight.test.svelte";
import HighlightAction from "./HighlightAction.test.svelte";
import HighlightAutoLanguageRestriction from "./HighlightAuto.languageRestriction.test.svelte";
import HighlightAuto from "./HighlightAuto.test.svelte";
import HighlightEditableBinding from "./HighlightEditable.binding.test.svelte";
import HighlightEditable from "./HighlightEditable.test.svelte";
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
