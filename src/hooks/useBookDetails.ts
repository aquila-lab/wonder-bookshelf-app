import { useEffect, useState } from 'react';
import { fetchBookDescription } from '../lib/open-library';
import type { AsyncStatus, Book } from '../types/book';

interface DetailResult {
  id: string;
  description?: string;
  status: AsyncStatus;
}

export function useBookDetails(book: Book | null) {
  const [result, setResult] = useState<DetailResult | null>(null);
  const id = book?.id;
  const isRemote = Boolean(id?.startsWith('/works/'));

  useEffect(() => {
    if (!id || !isRemote) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('timeout'), 12_000);
    setResult({ id, status: 'loading' });
    void fetchBookDescription(id, controller.signal)
      .then((description) => {
        if (!controller.signal.aborted)
          setResult({ id, description, status: 'done' });
      })
      .catch(() => {
        if (
          !controller.signal.aborted ||
          controller.signal.reason === 'timeout'
        )
          setResult({ id, status: 'error' });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort('cleanup');
    };
  }, [id, isRemote]);

  const current = result?.id === id ? result : null;
  const status: AsyncStatus = isRemote
    ? (current?.status ?? 'loading')
    : 'idle';
  return {
    book: book
      ? { ...book, description: current?.description ?? book.description }
      : null,
    status,
  };
}
