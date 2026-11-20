import { COALESCE_MS, createEditHistory } from "../src/editable-history.js";

const at = (n: number) => ({ start: n, end: n });

function setup(initial: string, limit = 200) {
  let time = 1000;
  const history = createEditHistory({ limit: () => limit, now: () => time });
  history.reset(initial);
  let code = initial;
  return {
    history,
    get code() {
      return code;
    },
    /** Applies an edit and records it, as the component does. */
    edit(next: string, caret: number, coalesce = false) {
      history.record(code, next, at(caret), coalesce);
      code = next;
    },
    undo() {
      const move = history.undo(code);
      if (move) code = move.code;
      return move;
    },
    redo() {
      const move = history.redo(code);
      if (move) code = move.code;
      return move;
    },
    tick(ms: number) {
      time += ms;
    },
  };
}

describe("createEditHistory", () => {
  it("starts with one state that cannot be undone", () => {
    const h = setup("abc");
    expect(h.history.isEmpty).toBe(false);
    expect(h.history.canUndo()).toBe(false);
    expect(h.history.canRedo()).toBe(false);
    expect(h.undo()).toBeNull();
    expect(h.redo()).toBeNull();
    expect(h.history.snapshot()).toEqual({
      entries: [{ size: 3 }],
      index: 0,
      canUndo: false,
      canRedo: false,
    });
  });

  it("is empty until reset", () => {
    const history = createEditHistory({ limit: () => 200 });
    expect(history.isEmpty).toBe(true);
    history.reset("");
    expect(history.isEmpty).toBe(false);
  });

  it("undoes and redoes back to each state with its selection", () => {
    const h = setup("let a = 1;");
    h.edit("let ab = 1;", 6);
    h.edit("let ab = 12;", 11);

    expect(h.undo()).toEqual({ code: "let ab = 1;", selection: at(6) });
    expect(h.undo()).toEqual({ code: "let a = 1;", selection: at(0) });
    expect(h.undo()).toBeNull();

    expect(h.redo()).toEqual({ code: "let ab = 1;", selection: at(6) });
    expect(h.redo()).toEqual({ code: "let ab = 12;", selection: at(11) });
    expect(h.redo()).toBeNull();
  });

  it("joins typing within the coalesce window into one step", () => {
    const h = setup("");
    h.edit("a", 1);
    h.tick(10);
    h.edit("ab", 2, true);
    h.tick(COALESCE_MS - 1);
    h.edit("abc", 3, true);

    expect(h.history.snapshot().index).toBe(2);
    expect(h.undo()).toEqual({ code: "a", selection: at(1) });
  });

  it("starts a new step after the coalesce window", () => {
    const h = setup("");
    h.edit("a", 1);
    h.edit("ab", 2, true);
    h.tick(COALESCE_MS);
    h.edit("abc", 3, true);

    expect(h.undo()?.code).toBe("ab");
    expect(h.undo()?.code).toBe("a");
  });

  it("never coalesces into the initial state", () => {
    const h = setup("x");
    h.edit("xy", 2, true);
    expect(h.undo()).toEqual({ code: "x", selection: at(0) });
  });

  it("drops the redo stack on a new edit", () => {
    const h = setup("a");
    h.edit("ab", 2);
    h.undo();
    expect(h.history.canRedo()).toBe(true);
    h.edit("ac", 2);
    expect(h.history.canRedo()).toBe(false);
  });

  it("keeps at most `limit` states, read on each record", () => {
    let limit = 3;
    const history = createEditHistory({ limit: () => limit });
    history.reset("");
    let code = "";
    for (const next of ["a", "ab", "abc", "abcd"]) {
      history.record(code, next, at(next.length), false);
      code = next;
    }
    expect(history.snapshot().entries).toHaveLength(3);

    limit = 0; // Clamped to 1.
    history.record(code, "abcde", at(5), false);
    expect(history.snapshot().entries).toEqual([{ size: 5 }]);
    expect(history.canUndo()).toBe(false);
  });

  it("lists undo then redo entries in document order", () => {
    const h = setup("");
    h.edit("a", 1);
    h.edit("ab", 2);
    h.edit("abc", 3);
    h.undo();
    h.undo();
    expect(h.history.snapshot()).toEqual({
      entries: [{ size: 0 }, { size: 1 }, { size: 2 }, { size: 3 }],
      index: 1,
      canUndo: true,
      canRedo: true,
    });
  });

  it("moves the latest caret so undo of the next edit restores it", () => {
    const h = setup("hello");
    h.edit("hello!", 6);
    h.history.moveCaret(6, { start: 0, end: 2 });
    h.edit("hello!?", 7);
    expect(h.undo()?.selection).toEqual({ start: 0, end: 2 });
  });

  it("ignores a caret move when the length shows a stale entry", () => {
    const h = setup("hello");
    h.edit("hello!", 6);
    h.history.moveCaret(99, at(1));
    h.edit("hello!?", 7);
    expect(h.undo()?.selection).toEqual(at(6));
  });

  it("round-trips edits anywhere in the document", () => {
    const states = [
      "function f() {\n  return 1;\n}",
      "function f() {\n  return 12;\n}",
      "function g() {\n  return 12;\n}",
      "// top\nfunction g() {\n  return 12;\n}",
      "// top\nfunction g() {\n}",
      "",
      "rewritten",
    ];
    const h = setup(states[0] as string);
    for (const next of states.slice(1)) h.edit(next, 0);
    for (let i = states.length - 2; i >= 0; i--) {
      expect(h.undo()?.code).toBe(states[i] as string);
    }
    for (let i = 1; i < states.length; i++) {
      expect(h.redo()?.code).toBe(states[i] as string);
    }
  });
});
