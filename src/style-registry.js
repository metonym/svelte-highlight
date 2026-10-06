/**
 * Ownership registry for HighlightStyle's injected `<style>` tags, kept out
 * of the component so it can be unit-tested (see
 * tests/style-registry.test.ts).
 *
 * Instances sharing a key queue up in registration order; only the oldest
 * still-registered instance renders the `<style>`. A store (rather than a
 * plain ref count) means that when that instance leaves, the remaining
 * subscribers reactively re-derive a new owner instead of the tag being
 * dropped while siblings still need it.
 */
import { writable } from "svelte/store";

/** @typedef {import("svelte/store").Writable<symbol[]>} Owners */

export function createStyleRegistry() {
  /** @type {Map<string, Owners>} */
  const registries = new Map();

  return {
    /**
     * Adds `token` as the newest owner of `key`.
     * @param {string} key
     * @param {symbol} token
     * @returns {Owners} The key's owner list, to subscribe to.
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
     * Removes `token` from `owners`, and drops `key` once its last owner
     * leaves. Keys embed the full theme CSS, so a long-lived app that
     * cycles themes would otherwise keep every theme it ever showed.
     * @param {string} key
     * @param {Owners} owners The store `register` returned for `key`.
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

    /** Number of keys with at least one owner. */
    get size() {
      return registries.size;
    },
  };
}
