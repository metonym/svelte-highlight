import {
  indentSelection,
  replaceSelection,
  shiftLines,
} from "../src/editable-commands.js";

/**
 * Writes code with the selection marked: `|` for a caret, `[` and `]` for
 * a range. Keeps expectations readable.
 */
function mark(code: string, sel: { start: number; end: number }) {
  if (sel.start === sel.end) {
    return `${code.slice(0, sel.start)}|${code.slice(sel.start)}`;
  }
  return `${code.slice(0, sel.start)}[${code.slice(sel.start, sel.end)}]${code.slice(sel.end)}`;
}

function parse(marked: string) {
  const caret = marked.indexOf("|");
  if (caret !== -1) {
    return {
      code: marked.replace("|", ""),
      selection: { start: caret, end: caret },
    };
  }
  const start = marked.indexOf("[");
  const end = marked.indexOf("]") - 1;
  return {
    code: marked.replace("[", "").replace("]", ""),
    selection: { start, end },
  };
}

type Command = (
  code: string,
  sel: { start: number; end: number },
) => { code: string; selection: { start: number; end: number } } | null;

function run(command: Command, marked: string) {
  const { code, selection } = parse(marked);
  const edit = command(code, selection);
  return edit && mark(edit.code, edit.selection);
}

describe("replaceSelection", () => {
  const insert =
    (text: string) => (code: string, sel: { start: number; end: number }) =>
      replaceSelection(code, sel, text);

  it("inserts at the caret", () => {
    expect(run(insert("x"), "a|b")).toBe("ax|b");
  });

  it("replaces a range and collapses after the text", () => {
    expect(run(insert("\n"), "a[bc]d")).toBe("a\n|d");
  });

  it("deletes a range with empty text", () => {
    expect(run(insert(""), "a[bc]d")).toBe("a|d");
  });
});

describe("shiftLines", () => {
  const indent = (code: string, sel: { start: number; end: number }) =>
    shiftLines(code, sel, 2, false);
  const outdent = (code: string, sel: { start: number; end: number }) =>
    shiftLines(code, sel, 2, true);

  it("indents every line the selection touches", () => {
    expect(run(indent, "a\nb[c\nd]e\nf")).toBe("a\n  b[c\n  d]e\nf");
  });

  it("skips blank lines on indent", () => {
    expect(run(indent, "[a\n\nb]")).toBe("  [a\n\n  b]");
  });

  it("outdents by at most the leading spaces", () => {
    expect(run(outdent, "[    a\n b\nc]")).toBe("[  a\nb\nc]");
  });

  it("keeps the start on the first line when outdent eats past it", () => {
    expect(run(outdent, "x\n [ a\n  b]")).toBe("x\n[a\nb]");
  });

  it("returns null when nothing changes", () => {
    expect(run(outdent, "[a\nb]")).toBeNull();
    expect(run(indent, "a\n|\nb")).toBeNull();
  });

  // Only the text before the selection end counts, so a caret at column 0
  // sees an empty line. Kept as-is; Shift+Tab there does nothing.
  it("ignores the rest of the line after a caret at column 0", () => {
    expect(run(outdent, "  a\n|  b")).toBeNull();
  });

  it("uses the given tab size", () => {
    const four = (code: string, sel: { start: number; end: number }) =>
      shiftLines(code, sel, 4, false);
    expect(run(four, "a|")).toBe("    a|");
  });
});

describe("indentSelection", () => {
  const tab = (code: string, sel: { start: number; end: number }) =>
    indentSelection(code, sel, 2);

  it("inserts spaces at a caret", () => {
    expect(run(tab, "a|b")).toBe("a  |b");
  });

  it("replaces a selection within one line", () => {
    expect(run(tab, "a[bc]d")).toBe("a  |d");
  });

  it("indents lines when the selection spans lines", () => {
    expect(run(tab, "[a\nb]")).toBe("  [a\n  b]");
  });
});
