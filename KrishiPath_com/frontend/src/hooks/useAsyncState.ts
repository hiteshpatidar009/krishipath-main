import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncStateReturn<T> extends AsyncState<T> {
  execute: (...args: unknown[]) => Promise<void>;
  setData: (data: T) => void;
  reset: () => void;
}

/**
 * Generic hook that manages loading / error / data state for any async operation.
 *
 * Usage:
 *   const { data, loading, error, execute } = useAsyncState(fetchSomething);
 *   useEffect(() => { execute(); }, []);
 */
export function useAsyncState<T>(
  asyncFn: (...args: unknown[]) => Promise<T>
): UseAsyncStateReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await asyncFn(...args);
        setState({ data, loading: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setState({ data: null, loading: false, error: message });
      }
    },
    [asyncFn]
  );

  const setData = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, setData, reset };
}
