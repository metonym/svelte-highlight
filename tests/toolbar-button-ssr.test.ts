import { render } from "svelte/server";
import "./svelte-server.ts";

const load = async () => (await import("../src/ToolbarButton.svelte")).default;

describe("ToolbarButton SSR", () => {
  it("renders a button with a label and tooltip, and no aria-pressed by default", async () => {
    const ToolbarButton = await load();

    const { body } = render(ToolbarButton, { props: { label: "Download" } });

    expect(body).toContain("<button");
    expect(body).not.toContain("<a ");
    expect(body).toContain('type="button"');
    expect(body).toContain('aria-label="Download"');
    expect(body).toContain('title="Download"');
    expect(body).not.toContain("aria-pressed");
  });

  it("sets aria-pressed when pressed is set", async () => {
    const ToolbarButton = await load();

    const off = render(ToolbarButton, {
      props: { label: "Wrap", pressed: false },
    }).body;
    const on = render(ToolbarButton, {
      props: { label: "Wrap", pressed: true },
    }).body;

    expect(off).toContain('aria-pressed="false"');
    expect(on).toContain('aria-pressed="true"');
  });

  it("renders a link with no button-only attributes when href is set", async () => {
    const ToolbarButton = await load();

    const { body } = render(ToolbarButton, {
      props: {
        label: "Open",
        href: "https://example.com",
        pressed: true,
        target: "_blank",
      },
    });

    expect(body).toMatch(/<a[^>]*href="https:\/\/example\.com"/);
    expect(body).toContain('target="_blank"');
    expect(body).toContain('aria-label="Open"');
    expect(body).not.toContain("aria-pressed");
    expect(body).not.toContain('type="button"');
  });

  it("merges a caller's class with its own", async () => {
    const ToolbarButton = await load();

    const { body } = render(ToolbarButton, {
      props: { label: "X", class: "mine" },
    });

    expect(body).toMatch(/class="shl-toolbar-button mine svelte-[\w-]+"/);
  });
});
