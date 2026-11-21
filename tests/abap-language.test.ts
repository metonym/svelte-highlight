import { createRegistry } from "../src/engine.js";

import abap from "../src/languages/abap";

const registry = createRegistry();

registry.register(abap.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "abap" }).value;

test("abap keywords are case-insensitive", () => {
  const upper = highlight("LOOP AT lt_rows INTO ls_row.\nENDLOOP.");
  const lower = highlight("loop at lt_rows into ls_row.\nendloop.");

  expect(upper).toContain('<span class="hljs-keyword">LOOP</span>');
  expect(upper).toContain('<span class="hljs-keyword">ENDLOOP</span>');
  expect(lower).toContain('<span class="hljs-keyword">loop</span>');
  expect(lower).toContain('<span class="hljs-keyword">endloop</span>');
});

test('abap comments: * only in column 1, and " anywhere', () => {
  const result = highlight(
    '* full line\nlv_x = lv_a * lv_b. " inline\n"! @parameter iv_id | key',
  );

  expect(result).toContain('<span class="hljs-comment">* full line</span>');
  expect(result).toContain("lv_x = lv_a * lv_b.");
  expect(result).toContain('<span class="hljs-comment">&quot; inline</span>');
  expect(result).toContain('<span class="hljs-doctag">@parameter</span>');
});

test("abap highlights literals and string templates", () => {
  const result = highlight(
    "lv_a = 'It''s'.\nlv_b = `raw`.\nlv_c = |Hi { lv_name CASE = UPPER }!\\n|.",
  );

  expect(result).toContain(
    '<span class="hljs-string">&#x27;It&#x27;&#x27;s&#x27;</span>',
  );
  expect(result).toContain('<span class="hljs-string">`raw`</span>');
  expect(result).toContain(
    '<span class="hljs-string">|Hi <span class="hljs-subst">{ lv_name <span class="hljs-keyword">CASE</span> = <span class="hljs-keyword">UPPER</span> }</span>!<span class="hljs-char escape_">\\n</span>|</span>',
  );
});

test("abap highlights inline declarations, field symbols, and host variables", () => {
  const result = highlight(
    "SELECT * FROM sflight WHERE carrid = @lv_id INTO TABLE @DATA(lt_rows).\n" +
      "LOOP AT lt_rows ASSIGNING FIELD-SYMBOL(<ls_row>).\n" +
      "  <ls_row>-price = 0.\nENDLOOP.",
  );

  expect(result).toContain('<span class="hljs-variable">@lv_id</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">@DATA</span>(<span class="hljs-variable">lt_rows</span>)',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">FIELD-SYMBOL</span>(<span class="hljs-variable">&lt;ls_row&gt;</span>)',
  );
  expect(result).toContain(
    '<span class="hljs-variable">&lt;ls_row&gt;</span>-price',
  );
});

test("abap highlights class and method declarations and types", () => {
  const result = highlight(
    "CLASS lcl_app DEFINITION INHERITING FROM zcl_base.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS run IMPORTING it_rows TYPE STANDARD TABLE OF ty_row.\n" +
      "ENDCLASS.\n" +
      "METHOD if_oo_adt_classrun~main.\nENDMETHOD.",
  );

  expect(result).toContain('<span class="hljs-title class_">lcl_app</span>');
  expect(result).toContain(
    '<span class="hljs-title class_ inherited__">zcl_base</span>',
  );
  expect(result).toContain('<span class="hljs-title function_">run</span>');
  expect(result).toContain('<span class="hljs-type">ty_row</span>');
  expect(result).toContain('<span class="hljs-keyword">STANDARD</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">if_oo_adt_classrun~main</span>',
  );
});

test("abap highlights selectors, calls, constructors, and system fields", () => {
  const result = highlight(
    "lo_log->add( lv_text ).\n" +
      "zcl_util=>log( lines( lt_rows ) ).\n" +
      "DATA(lo_json) = NEW /ui2/cl_json( ).\n" +
      "IF sy-subrc <> 0. ENDIF.",
  );

  expect(result).toContain(
    '<span class="hljs-operator">-&gt;</span><span class="hljs-title function_ invoke__">add</span>',
  );
  expect(result).toContain(
    '<span class="hljs-title class_">zcl_util</span><span class="hljs-operator">=&gt;</span>',
  );
  expect(result).toContain('<span class="hljs-built_in">lines</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">NEW</span> <span class="hljs-title class_">/ui2/cl_json</span>',
  );
  expect(result).toContain(
    '<span class="hljs-variable language_">sy-subrc</span>',
  );
});

test("abap keeps offset access, attributes, and additions apart", () => {
  const result = highlight(
    "lv_year = lv_date(4).\nlo_doc->data = 1.\nAPPEND LINES OF lt_a TO lt_b.",
  );

  expect(result).toContain("lv_date(<span");
  expect(result).not.toContain("invoke__");
  expect(result).toContain(
    '<span class="hljs-operator">-&gt;</span><span class="hljs-property">data</span> =',
  );
  expect(result).toContain('<span class="hljs-keyword">LINES</span>');
});
