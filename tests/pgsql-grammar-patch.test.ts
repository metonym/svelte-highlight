import hljsFactory from "highlight.js/lib/core";
import patchedPgsql from "../scripts/hljs-patches/pgsql.js";
import { createRegistry } from "../src/engine.js";
import pgsql from "../src/languages/pgsql.js";

// scripts/hljs-patches/pgsql.js: MERGE and SQL/JSON clause keywords.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("pgsql", patchedPgsql.register);

const registry = createRegistry();
registry.register(pgsql.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "pgsql" }).value;
  const actual = registry.highlight(code, { language: "pgsql" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("pgsql grammar patch", () => {
  it("styles a MERGE statement", () => {
    const html = expectMatchesHljs(
      "MERGE INTO account a\nUSING tx t ON t.id = a.id\nWHEN MATCHED AND t.amount > 0 THEN\n  UPDATE SET balance = balance + t.amount\nWHEN NOT MATCHED THEN\n  INSERT (id, balance) VALUES (t.id, t.amount)\nRETURNING merge_action(), a.*;",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">MERGE</span> <span class="hljs-keyword">INTO</span>',
    );
    expect(html).toContain(
      '<span class="hljs-keyword">WHEN MATCHED</span> <span class="hljs-keyword">AND</span>',
    );
    expect(html).toContain(
      '<span class="hljs-keyword">WHEN NOT MATCHED</span> <span class="hljs-keyword">THEN</span>',
    );
    expect(html).toContain(
      '<span class="hljs-keyword">RETURNING</span> merge_action(), a.*;',
    );
  });

  it("styles NOT MATCHED BY SOURCE and BY TARGET", () => {
    const html = expectMatchesHljs(
      "MERGE INTO t USING s ON true\nWHEN NOT MATCHED BY SOURCE THEN DELETE\nWHEN NOT MATCHED BY TARGET THEN DO NOTHING;",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">WHEN NOT MATCHED BY SOURCE</span>',
    );
    expect(html).toContain(
      '<span class="hljs-keyword">WHEN NOT MATCHED BY TARGET</span>',
    );
  });

  it("styles JSON_TABLE clause keywords", () => {
    const html = expectMatchesHljs(
      "SELECT jt.* FROM films,\n  JSON_TABLE(js, '$.favorites[*]' COLUMNS (\n    director text PATH '$.director' KEEP QUOTES,\n    has_title boolean EXISTS PATH '$.title',\n    tags jsonb PATH '$.tags' WITH CONDITIONAL WRAPPER,\n    NESTED PATH '$.films[*]' COLUMNS (t text PATH '$.title')\n  ) ERROR ON ERROR) AS jt;",
    );
    expect(html).toContain('<span class="hljs-keyword">KEEP QUOTES</span>');
    expect(html).toContain('<span class="hljs-keyword">EXISTS PATH</span>');
    expect(html).toContain(
      '<span class="hljs-keyword">CONDITIONAL WRAPPER</span>',
    );
    expect(html).toContain('<span class="hljs-keyword">NESTED PATH</span>');
    expect(html).toContain('<span class="hljs-keyword">ERROR ON ERROR</span>');
  });

  it("styles ON EMPTY after a default value", () => {
    const html = expectMatchesHljs(
      "SELECT JSON_VALUE(j, '$.a' DEFAULT 0 ON EMPTY NULL ON ERROR);",
    );
    expect(html).toContain(
      '<span class="hljs-number">0</span> <span class="hljs-keyword">ON EMPTY</span> <span class="hljs-keyword">NULL</span> <span class="hljs-keyword">ON ERROR</span>',
    );
  });

  it("keeps columns named matched, source, and target plain", () => {
    const html = expectMatchesHljs(
      "SELECT matched, source, target FROM t WHERE error = 1;",
    );
    expect(html).toContain(
      '<span class="hljs-keyword">SELECT</span> matched, source, target <span class="hljs-keyword">FROM</span> t <span class="hljs-keyword">WHERE</span> error =',
    );
  });

  it("keeps the type PATH after a column type unchanged", () => {
    const html = expectMatchesHljs("CREATE TABLE r (p path, kind text);");
    expect(html).toContain('(p <span class="hljs-type">path</span>,');
  });
});
