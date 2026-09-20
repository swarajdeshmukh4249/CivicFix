import { useEffect, useRef, useState } from "react";
import { ApiError } from "../api/client";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Runs `fetcher` on mount and whenever `deps` change. Guards against
 * setting state after unmount/re-run (a fast filter change firing a new
 * request before the old one resolves). */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[]): ApiState<T> & { reload: () => void } {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null });
  const requestId = useRef(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (requestId.current === id) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (requestId.current === id) {
          const message = err instanceof ApiError ? err.message : "Could not reach the server.";
          setState({ data: null, loading: false, error: message });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { ...state, reload: () => setReloadKey((k) => k + 1) };
}
