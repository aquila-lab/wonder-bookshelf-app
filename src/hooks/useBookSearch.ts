import { useEffect, useRef, useState } from 'react';
import { searchBooks } from '../lib/open-library';
import type { AsyncStatus, Book } from '../types/book';

interface SearchResult {
  query: string;
  books: Book[];
  status: AsyncStatus;
}

export function useBookSearch(query: string, enabled: boolean) {
  const [result, setResult] = useState<SearchResult>({
    query: '',
    books: [],
    status: 'idle',
  });
  const [attempt, setAttempt] = useState(0);
  const cache = useRef(new Map<string, Book[]>());
  const trimmedQuery = query.trim();
  const active = enabled && Boolean(trimmedQuery);

  useEffect(() => {
    if (!active || cache.current.has(trimmedQuery)) return;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    setResult({ query: trimmedQuery, books: [], status: 'loading' });
    const debounce = setTimeout(async () => {
      timeout = setTimeout(() => controller.abort('timeout'), 15_000);
      try {
        const books = await searchBooks(trimmedQuery, controller.signal);
        if (!controller.signal.aborted) {
          cache.current.set(trimmedQuery, books);
          setResult({ query: trimmedQuery, books, status: 'done' });
        }
      } catch {
        if (
          !controller.signal.aborted ||
          controller.signal.reason === 'timeout'
        ) {
          setResult({ query: trimmedQuery, books: [], status: 'error' });
        }
      } finally {
        clearTimeout(timeout);
      }
    }, 500);
    return () => {
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [active, trimmedQuery, attempt]);

  const current = result.query === trimmedQuery ? result : undefined;
  const cached = cache.current.get(trimmedQuery);
  const status: AsyncStatus = !active
    ? 'idle'
    : cached
      ? 'done'
      : (current?.status ?? 'loading');
  return {
    books: active ? (cached ?? current?.books ?? []) : [],
    status,
    retry: () => setAttempt((value) => value + 1),
  };
}
