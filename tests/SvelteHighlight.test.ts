import { test, expect, describe, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { SvelteHighlight } from "./examples";
import { tick } from "svelte";

describe("SvelteHighlight", () => {
  let instance: null | SvelteHighlight = null;

  afterEach(() => {
    instance?.$destroy();
    instance = null;
    document.body.innerHTML = "";
  });

  test("SvelteHighlight", async () => {
    expect(document.head.querySelector("style")).toBeNull();

    const target = document.querySelector("body")!;

    instance = new SvelteHighlight({
      target,
      props: {},
    });

    expect(document.head.querySelector("style")?.innerHTML).toBeTruthy();

    expect(
      target.querySelector("#highlighted")?.innerHTML
    ).toMatchInlineSnapshot(
      '"&lt;span class=\\"hljs-keyword\\"&gt;const&lt;/span&gt; &lt;span class=\\"hljs-title function_\\"&gt;add&lt;/span&gt; = (&lt;span class=\\"hljs-params\\"&gt;a: number, b: number&lt;/span&gt;) =&amp;gt; a + b;"'
    );

    expect(
      target.querySelector("#langtag")?.getAttribute("data-language")
    ).toEqual("svelte");

    expect(
      target.querySelector("#highlight-auto")?.innerHTML
    ).toMatchInlineSnapshot(
      '"<code class=\\"hljs\\">const add = (a: number, b: number) =&gt; a + b;</code>"'
    );

    userEvent.click(target.querySelector("button")!);
    await tick();

    expect(
      target.querySelector("#highlight-auto")?.innerHTML
    ).toMatchInlineSnapshot(
      '"<code class=\\"hljs\\"><span class=\\"hljs-tag\\">&lt;<span class=\\"hljs-name\\">button</span> <span class=\\"hljs-attr\\">on:click</span>&gt;</span>Click me<span class=\\"hljs-tag\\">&lt;/<span class=\\"hljs-name\\">button</span>&gt;</span></code>"'
    );
  });
});
