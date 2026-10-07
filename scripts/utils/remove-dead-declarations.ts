import type { AtRule, Plugin, Rule } from "postcss";

const SIMPLE_CLASS_SELECTOR = /^\.[\w-]+$/;

/** At-rule ancestor chain: only identically nested rules can shadow each other. */
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

/** Mutated in place. */
export type RemoveDeadDeclarationsStats = { removedCount: number };

/**
 * Drops a selector from a rule when every property the rule declares for it
 * is overridden by a later rule in the same scope. Only bare single-class
 * selectors, so specificity is equal and order alone decides the winner.
 */
export const removeDeadDeclarations = (
  stats?: RemoveDeadDeclarationsStats,
): Plugin => ({
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
      if (stats) stats.removedCount += deadSelectors.size;
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
