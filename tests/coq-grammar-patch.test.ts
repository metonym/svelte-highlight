import hljsFactory from "highlight.js/lib/core";
import stockCoq from "highlight.js/lib/languages/coq";
import patchedCoq from "../scripts/hljs-patches/coq.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import coq from "../src/languages/coq.js";

// scripts/hljs-patches/coq.js: the `rocq` alias.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("coq", patchedCoq.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("coq", stockCoq);

const registry = createRegistry();
registry.register(coq.register);

const CODE = `(* Addition is commutative. *)
Theorem add_comm : forall n m : nat, n + m = m + n.
Proof.
  intros n m. induction n as [| n' IHn'].
  - simpl. rewrite <- plus_n_O. reflexivity.
  - simpl. rewrite -> IHn'. rewrite plus_n_Sm. reflexivity.
Qed.`;

describe("coq grammar patch", () => {
  it("resolves rocq to coq", () => {
    expect(resolveLanguageName("rocq")).toBe("coq");
    expect(resolveLanguageName("Rocq")).toBe("coq");
  });

  it("highlights through the rocq alias", () => {
    const html = registry.highlight(CODE, { language: "rocq" }).value;
    expect(html).toContain('<span class="hljs-keyword">Theorem</span>');
    expect(html).toContain('<span class="hljs-keyword">forall</span>');
    expect(html).toContain(
      '<span class="hljs-comment">(* Addition is commutative. *)</span>',
    );
  });

  it("does not change Coq output", () => {
    const expected = stock.highlight(CODE, { language: "coq" }).value;
    expect(hljs.highlight(CODE, { language: "coq" }).value).toEqual(expected);
    expect(registry.highlight(CODE, { language: "coq" }).value).toEqual(
      expected,
    );
  });
});
