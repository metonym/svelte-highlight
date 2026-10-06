import { get } from "svelte/store";
import { createStyleRegistry } from "../src/style-registry.js";

describe("createStyleRegistry", () => {
  it("drops every key once all instances across themes unmount", () => {
    const registry = createStyleRegistry();
    const mounted = ["github", "a11y-dark", "nord"].map((theme) => {
      const token = Symbol(theme);
      return { key: theme, token, owners: registry.register(theme, token) };
    });
    expect(registry.size).toBe(3);

    for (const { key, owners, token } of mounted) {
      registry.unregister(key, owners, token);
    }
    expect(registry.size).toBe(0);
  });

  it("keeps a shared key until its last owner leaves", () => {
    const registry = createStyleRegistry();
    const first = Symbol("first");
    const second = Symbol("second");
    const owners = registry.register("github", first);
    expect(registry.register("github", second)).toBe(owners);
    expect(get(owners)).toEqual([first, second]);

    // The oldest owner renders the tag; when it leaves, the next takes over.
    registry.unregister("github", owners, first);
    expect(get(owners)).toEqual([second]);
    expect(registry.size).toBe(1);

    registry.unregister("github", owners, second);
    expect(registry.size).toBe(0);
  });

  it("drops the old key when a live instance switches themes", () => {
    const registry = createStyleRegistry();
    const token = Symbol("instance");
    const before = registry.register("a11y-dark", token);

    registry.unregister("a11y-dark", before, token);
    registry.register("github", token);

    expect(registry.size).toBe(1);
    expect(registry.register("a11y-dark", Symbol("other"))).not.toBe(before);
  });

  it("leaves a re-created key alone when a stale owner leaves", () => {
    const registry = createStyleRegistry();
    const stale = Symbol("stale");
    const staleOwners = registry.register("github", stale);
    registry.unregister("github", staleOwners, stale);

    const fresh = Symbol("fresh");
    const freshOwners = registry.register("github", fresh);
    // A late unregister against the old store must not drop the new one.
    registry.unregister("github", staleOwners, stale);

    expect(registry.size).toBe(1);
    expect(get(freshOwners)).toEqual([fresh]);
  });
});
