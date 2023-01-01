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
        "<pre data-language=\\"css\\" id=\\"highlight-auto-css\\" class=\\"langtag svelte-d72vtw\\"><code class=\\"hljs\\"><span class=\\"hljs-selector-tag\\">body</span> {
          <span class=\\"hljs-attribute\\">padding</span>: <span class=\\"hljs-number\\">0</span>;
          <span class=\\"hljs-attribute\\">color</span>: red;
        }</code></pre>"
      `);
    expect(target.querySelector("#inferred-language")?.innerHTML).toEqual(
      "css"
    );

    await userEvent.click(target.querySelector("button")!);

    expect(
      target.querySelector("#highlight-auto")?.innerHTML
    ).toMatchInlineSnapshot(
      '"<code class=\\"hljs\\">&lt;<span class=\\"hljs-keyword\\">button</span> <span class=\\"hljs-keyword\\">on</span>:click&gt;Click me&lt;/<span class=\\"hljs-keyword\\">button</span>&gt;</code>"'
    );

    expect(target.querySelector("#line-numbers")?.innerHTML)
      .toMatchInlineSnapshot(`
        "<div style=\\"overflow-x: auto;\\" class=\\"svelte-1kmlnkb\\"><table class=\\"svelte-1kmlnkb\\"><tbody class=\\"hljs\\"><tr class=\\"svelte-1kmlnkb\\"><td class=\\"svelte-1kmlnkb hljs\\" style=\\"position: sticky; left: 0px; text-align: right; user-select: none; width: 24px;\\"><code>1</code></td> <td class=\\"svelte-1kmlnkb\\"><pre class=\\"svelte-1kmlnkb\\"><code>
        </code></pre></td> </tr></tbody></table></div>"
      `);
  });
});
