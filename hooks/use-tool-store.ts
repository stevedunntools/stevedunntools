"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getToolValue, setToolValue } from "@/lib/tool-store";

/**
 * React hook to read/write a value in the shared tool store.
 * Automatically updates when another tool writes to the same key.
 */
export function useToolValue<T = unknown>(key: string, defaultValue?: T) {
  // Stabilize defaultValue to prevent infinite re-render loops
  // when callers pass inline objects/arrays
  const defaultRef = useRef(defaultValue);

  const [value, setValue] = useState<T | undefined>(() => {
    if (typeof window === "undefined") return defaultRef.current;
    return getToolValue<T>(key) ?? defaultRef.current;
  });

  useEffect(() => {
    // Sync on mount (handles SSR → client transition)
    const stored = getToolValue<T>(key);
    if (stored !== undefined) setValue(stored);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.key === key || detail.key === null) {
        setValue(detail.key === null ? defaultRef.current : detail.value as T);
      }
    };
    window.addEventListener("sdt-store-update", handler);
    return () => window.removeEventListener("sdt-store-update", handler);
  }, [key]);

  const set = useCallback(
    (newValue: T) => {
      setValue(newValue);
      setToolValue(key, newValue);
    },
    [key]
  );

  return [value, set] as const;
}
