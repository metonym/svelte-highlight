// Owners of HighlightStyle's `<style>` tags, per key, in registration order.
// Only the oldest renders; a store lets the rest re-derive a new owner when
// it leaves.

/**
 * A minimal store. It follows the Svelte store contract (`subscribe` calls
 * back at once and returns an unsubscriber), so `$owners` works in Svelte 4
 * and 5, but needs no framework.
 * @typedef {{
 *   subscribe(run: (value: symbol[]) => void): () => void,
 *   update(fn: (value: symbol[]) => symbol[]): void,
 * }} Owners
 */

/** @returns {Owners} */
function createOwners() {
  /** @type {symbol[]} */
  let value = [];
  /** @type {Set<{ run: (value: symbol[]) => void }>} */
  const subscribers = new Set();
  return {
    subscribe(run) {
      const subscriber = { run };
      subscribers.add(subscriber);
      run(value);
      return () => {
        subscribers.delete(subscriber);
      };
    },
    update(fn) {
      const next = fn(value);
      if (next === value) return;
      value = next;
      for (const subscriber of [...subscribers]) subscriber.run(value);
    },
  };
}

export function createStyleRegistry() {
  /** @type {Map<string, Owners>} */
  const registries = new Map();

  return {
    /**
     * @param {string} key
     * @param {symbol} token
     * @returns {Owners}
     */
    register(key, token) {
      let owners = registries.get(key);
      if (!owners) {
        owners = createOwners();
        registries.set(key, owners);
      }
      owners.update((list) => [...list, token]);
      return owners;
    },

    /**
     * Drops `key` once empty: keys embed full theme CSS and would otherwise leak.
     * @param {string} key
     * @param {Owners} owners
     * @param {symbol} token
     */
    unregister(key, owners, token) {
      let empty = false;
      owners.update((list) => {
        const remaining = list.filter((owner) => owner !== token);
        empty = remaining.length === 0;
        return remaining;
      });
      if (empty && registries.get(key) === owners) registries.delete(key);
    },

    get size() {
      return registries.size;
    },
  };
}
