/**
 * Shared tool data store using sessionStorage.
 *
 * Tools can write named values (e.g. "simple-damages-estimator.totalDamages")
 * and other tools can read them to pre-populate fields.
 *
 * Data persists until the browser tab is closed or the user clears it.
 */

const STORE_KEY = "sdt-tool-data";

function getStore(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // sessionStorage quota exceeded — silently ignore
  }
}

/** Write a value to the shared store. Key format: "toolSlug.fieldName" */
export function setToolValue(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  const store = getStore();
  store[key] = value;
  saveStore(store);
  window.dispatchEvent(new CustomEvent("sdt-store-update", { detail: { key, value } }));
}

/** Read a value from the shared store. Returns undefined if not set. */
export function getToolValue<T = unknown>(key: string): T | undefined {
  const store = getStore();
  return store[key] as T | undefined;
}

/** Read all values matching a prefix (e.g. "simple-damages-estimator.") */
export function getToolValues(prefix: string): Record<string, unknown> {
  const store = getStore();
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(store)) {
    if (k.startsWith(prefix)) {
      result[k.slice(prefix.length)] = v;
    }
  }
  return result;
}

/** Clear all shared tool data */
export function clearToolStore() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORE_KEY);
  window.dispatchEvent(new CustomEvent("sdt-store-update", { detail: { key: null, value: null } }));
}
