"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Generic hook for polling an API endpoint on an interval.
 * Falls back to a seed generator if the fetch fails or returns no data.
 */
export function usePolledState<T>(
  apiPath: string,
  hasData: (data: T) => boolean,
  generateSeed: () => T,
  intervalMs = 30_000,
) {
  const [state, setState] = useState<(T & { seed?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const seedRef = useRef(false);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(apiPath);
      if (res.ok) {
        const data: T = await res.json();
        if (hasData(data)) {
          setState(data as T & { seed?: boolean });
          seedRef.current = false;
          setLoading(false);
          return;
        }
      }
    } catch {
      // skip
    }
    if (!seedRef.current) {
      setState({ ...generateSeed(), seed: true } as T & { seed?: boolean });
      seedRef.current = true;
    }
    setLoading(false);
  }, [apiPath, hasData, generateSeed]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, intervalMs);
    return () => clearInterval(interval);
  }, [fetchState, intervalMs]);

  return { state, loading };
}
