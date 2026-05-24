"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Drop-in replacement for useState that persists to sessionStorage.
 *
 * The initial render (both SSR and the first client render) always returns
 * `initialValue` so server and client agree. The stored value is loaded in a
 * post-mount effect, which schedules a re-render with the persisted state.
 * This briefly shows empty inputs on first paint but avoids hydration
 * mismatches.
 */
export function useSessionState<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (v: T) => string;
    deserialize?: (s: string) => T;
  },
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;

  const [value, setValue] = useState<T>(initialValue);
  const skipNextWrite = useRef(true);

  // Load the stored value once after mount.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored !== null) setValue(deserialize(stored));
    } catch {
      // Storage unavailable — keep initialValue
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on change. Skip the very first run so the initialValue from the
  // pre-load render does not overwrite the stored value.
  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      sessionStorage.setItem(key, serialize(value));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }, [key, value, serialize]);

  return [value, setValue];
}

/** Clear all sessionStorage keys that start with the given prefix. */
export function clearSessionKeys(prefix: string): void {
  if (typeof window === "undefined") return;
  const toRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k?.startsWith(prefix)) toRemove.push(k);
  }
  toRemove.forEach((k) => sessionStorage.removeItem(k));
}

/** Serialize a Date | null to JSON-safe string. */
export const dateSerializer = {
  serialize: (v: Date | null): string => JSON.stringify(v ? v.toISOString() : null),
  deserialize: (s: string): Date | null => {
    const parsed = JSON.parse(s);
    return parsed ? new Date(parsed) : null;
  },
};
