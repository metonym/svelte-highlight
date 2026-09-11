import { createRegistry } from "../src/engine.js";

import splunk from "../src/languages/splunk";

const registry = createRegistry();

registry.register(splunk.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "splunk" }).value;

test("splunk highlights commands as keywords", () => {
  const result = highlight("search index=web | stats count by host");

  expect(result).toContain('<span class="hljs-keyword">search</span>');
  expect(result).toContain('<span class="hljs-keyword">stats</span>');
  expect(result).toContain('<span class="hljs-keyword">by</span>');
});

test("splunk highlights the pipe operator", () => {
  const result = highlight("search foo | stats count");

  expect(result).toContain('<span class="hljs-operator">|</span>');
});

test("splunk highlights key= search terms as attr", () => {
  const result = highlight("search index=web status=500");

  expect(result).toContain('<span class="hljs-attr">index</span>');
  expect(result).toContain('<span class="hljs-attr">status</span>');
});

test("splunk highlights boolean operators and eval functions", () => {
  const result = highlight("where error_rate > 0.05 AND count(x)");

  expect(result).toContain('<span class="hljs-keyword">AND</span>');
  expect(result).toContain('<span class="hljs-built_in">count</span>');
});

test("splunk highlights triple-backtick comments and macro calls", () => {
  const result = highlight(
    "``` count errors ```\n| `my_macro(web, 5)` | stats count",
  );

  expect(result).toContain(
    '<span class="hljs-comment">``` count errors ```</span>',
  );
  expect(result).toContain(
    '<span class="hljs-symbol">`my_macro(web, 5)`</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">stats</span>');
});

test("splunk treats AS, BY, and IN as keywords in either case", () => {
  const result = highlight(
    "stats count AS hits, dc(ip) as users BY host | search status IN (200, 201) | lookup l ip OUTPUT owner",
  );

  expect(result).toContain('<span class="hljs-keyword">AS</span> hits');
  expect(result).toContain('<span class="hljs-keyword">as</span> users');
  expect(result).toContain('<span class="hljs-keyword">BY</span> host');
  expect(result).toContain('<span class="hljs-keyword">IN</span> (');
  expect(result).toContain('<span class="hljs-keyword">OUTPUT</span> owner');
  expect(result).toContain('<span class="hljs-built_in">dc</span>(ip)');
});

test("splunk highlights time modifiers and exponent numbers", () => {
  const result = highlight(
    "earliest=-24h@h latest=now | bin _time span=15m | eval f=3.5e2, x=1.5",
  );

  expect(result).toContain('<span class="hljs-number">-24h@h</span>');
  expect(result).toContain('<span class="hljs-number">15m</span>');
  expect(result).toContain('<span class="hljs-number">3.5e2</span>');
  expect(result).toContain('<span class="hljs-number">1.5</span>');
  // A field name that starts with a digit-like token is left alone.
  expect(highlight("| eval m=1 | fields host")).not.toContain(
    '<span class="hljs-number">1m</span>',
  );
});

test("splunk highlights tstats, spath, foreach, and mvexpand commands", () => {
  const result = highlight(
    "| tstats count where index=web by _time span=1d | spath path=a | foreach * [eval x=1] | mvexpand tags",
  );

  expect(result).toContain('<span class="hljs-keyword">tstats</span>');
  expect(result).toContain('<span class="hljs-keyword">spath</span>');
  expect(result).toContain('<span class="hljs-keyword">foreach</span>');
  expect(result).toContain('<span class="hljs-keyword">mvexpand</span>');
  expect(result).toContain('<span class="hljs-number">1d</span>');
});
