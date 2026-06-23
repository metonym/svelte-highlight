import hljs from "highlight.js/lib/core";
import nickel from "../src/languages/nickel";

hljs.registerLanguage(nickel.name, nickel.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "nickel" }).value;

test("nickel highlights let/in keywords", () => {
  const result = highlight("let x = 1 in x");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">in</span>');
});

test("nickel highlights fun keyword", () => {
  const result = highlight("let f = fun x => x in f");

  expect(result).toContain('<span class="hljs-keyword">fun</span>');
});

test("nickel highlights enum tags", () => {
  const result = highlight("let color = 'Red in color");

  expect(result).toContain('<span class="hljs-symbol">&#x27;Red</span>');
});

test("nickel highlights strings and comments", () => {
  const result = highlight('# config\nname = "svelte"');

  expect(result).toContain('<span class="hljs-comment"># config</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;svelte&quot;</span>',
  );
});
