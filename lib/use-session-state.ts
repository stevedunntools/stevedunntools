"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Drop-in replacement for useState that persists to sessionStorage.
 * Falls back to initialValue when no stored value exists or on SSR.
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

  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? deserialize(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
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
