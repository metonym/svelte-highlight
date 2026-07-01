import type { AtRule, Plugin, Rule } from "postcss";

const SIMPLE_CLASS_SELECTOR = /^\.[\w-]+$/;

/** Ancestor `@media`/`@supports` chain, so conditional overrides (e.g. a
 * high-contrast-mode media query) are never compared against unconditional
 * rules — only rules nested identically can shadow one another. */
function scopeKeyOf(rule: Rule): string {
  const chain: string[] = [];
  let parent = rule.parent;
  while (parent && parent.type !== "root") {
    if (parent.type === "atrule") {
      const atRule = parent as AtRule;
      chain.unshift(`@${atRule.name} ${atRule.params}`);
    }
    parent = parent.parent;
  }
  return chain.join(">");
}

type Occurrence = {
  rule: Rule;
  selector: string;
  property: string;
  value: string;
  order: number;
  key: string;
};

/**
 * Highlight.js theme files occasionally declare the same simple class
 * selector's property twice (e.g. `.hljs-addition` colored once, then
 * re-colored later in the file) — the earlier declaration never applies and
 * is dead weight. Drops a selector from a rule only when every property that
 * rule declares for it is unconditionally overridden by a later rule in the
 * same scope.
 *
 * Only touches bare single-class selectors (`.hljs-x`, no combinators or
 * compounding), since specificity is then guaranteed identical and
 * declaration order alone decides the winner.
 */
export const removeDeadDeclarations = (): Plugin => ({
  postcssPlugin: "remove-dead-declarations",
  OnceExit(root) {
    const winner = new Map<string, { value: string; order: number }>();
    const occurrences: Occurrence[] = [];

    let order = 0;
    root.walkRules((rule) => {
      const simpleSelectors = rule.selectors.filter((s) =>
        SIMPLE_CLASS_SELECTOR.test(s),
      );
      if (simpleSelectors.length > 0) {
        const scopeKey = scopeKeyOf(rule);
        rule.walkDecls((decl) => {
          for (const selector of simpleSelectors) {
            const key = `${scopeKey}::${selector}::${decl.prop}`;
            occurrences.push({
              rule,
              selector,
              property: decl.prop,
              value: decl.value,
              order,
              key,
            });
            const existing = winner.get(key);
            if (!existing || order >= existing.order) {
              winner.set(key, { value: decl.value, order });
            }
          }
        });
      }
      order++;
    });

    // A selector is safe to drop from a rule only if EVERY property the rule
    // declares for it is dead — partial overlap (rule sets two properties,
    // only one gets overridden later) is left untouched, since removing the
    // selector would also discard the still-live property.
    const deadSelectorsByRule = new Map<Rule, Set<string>>();
    const rules = new Set(occurrences.map((o) => o.rule));
    for (const rule of rules) {
      const bySelector = new Map<string, Occurrence[]>();
      for (const occ of occurrences) {
        if (occ.rule !== rule) continue;
        if (!bySelector.has(occ.selector)) bySelector.set(occ.selector, []);
        bySelector.get(occ.selector)?.push(occ);
      }
      for (const [selector, occs] of bySelector) {
        const allDead = occs.every((occ) => {
          const win = winner.get(occ.key);
          return (
            win !== undefined &&
            win.order > occ.order &&
            win.value !== occ.value
          );
        });
        if (allDead) {
          if (!deadSelectorsByRule.has(rule))
            deadSelectorsByRule.set(rule, new Set());
          deadSelectorsByRule.get(rule)?.add(selector);
        }
      }
    }

    for (const [rule, deadSelectors] of deadSelectorsByRule) {
      const remaining = rule.selectors.filter((s) => !deadSelectors.has(s));
      if (remaining.length === 0) {
        rule.remove();
      } else if (remaining.length !== rule.selectors.length) {
        rule.selectors = remaining;
      }
    }
  },
});
removeDeadDeclarations.postcss = true;
