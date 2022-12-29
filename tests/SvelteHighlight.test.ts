import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import SvelteHighlight from "./SvelteHighlight.test.svelte";

describe("SvelteHighlight", () => {
  let instance: null | SvelteHighlight = null;

  beforeEach(() => {
    instance?.$destroy();
    instance = null;
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  test("SvelteHighlight", async () => {
    expect(document.head.querySelector("style")).toBeNull();

    const target = document.body;

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
      '"<code class=\\"hljs\\">const add = <span class=\\"hljs-function\\">(<span class=\\"hljs-params\\">a: <span class=\\"hljs-built_in\\">number</span>, b: <span class=\\"hljs-built_in\\">number</span></span>) =&gt;</span> a + b;</code>"'
    );

    expect(target.querySelector("#highlight-auto-css")?.outerHTML)
      .toMatchInlineSnapshot(`
        "<pre data-language=\\"css\\" id=\\"highlight-auto-css\\" class=\\"langtag svelte-4cqgwq\\"><code class=\\"hljs\\"><span class=\\"hljs-selector-tag\\">body</span> {
          <span class=\\"hljs-attribute\\">padding</span>: <span class=\\"hljs-number\\">0</span>;
          <span class=\\"hljs-attribute\\">color</span>: red;
        }</code></pre>"
      `);

    await userEvent.click(target.querySelector("button")!);

    expect(
      target.querySelector("#highlight-auto")?.innerHTML
    ).toMatchInlineSnapshot(
      '"<code class=\\"hljs\\">&lt;<span class=\\"hljs-keyword\\">button</span> <span class=\\"hljs-keyword\\">on</span>:click&gt;Click me&lt;/<span class=\\"hljs-keyword\\">button</span>&gt;</code>"'
    );

    expect(
      target.querySelector("#line-numbers")?.innerHTML
    ).toMatchInlineSnapshot(`
      "<div style=\\"overflow-x: auto;\\" class=\\"svelte-1gt16c9\\"><table style=\\"width: 100%;\\"><tbody class=\\"hljs\\"><tr><td class=\\"svelte-1gt16c9 hljs\\" style=\\"position: sticky; left: 0px; text-align: right; user-select: none; padding-top: 1em; padding-bottom: 1em; width: 54px; min-width: 54px;\\"><code>1</code></td> <td class=\\"svelte-1gt16c9\\"><pre class=\\"svelte-1gt16c9\\"><code>
      </code></pre></td> </tr></tbody></table></div>"
    `);
  });
});
