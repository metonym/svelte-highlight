// Owners of HighlightStyle's `<style>` tags, per key, in registration order.
// Only the oldest renders; a store lets the rest re-derive a new owner when
// it leaves.
import { writable } from "svelte/store";

/** @typedef {import("svelte/store").Writable<symbol[]>} Owners */

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
        owners = writable([]);
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
