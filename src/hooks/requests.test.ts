import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { Book } from '../types/book';
import { useBookDetails } from './useBookDetails';
import { useBookSearch } from './useBookSearch';

test('a slower previous search cannot overwrite the current query', async () => {
  vi.useFakeTimers();
  let resolveFirst: (response: Response) => void = () => {};
  const first = new Promise<Response>((resolve) => {
    resolveFirst = resolve;
  });
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockReturnValueOnce(first)
    .mockResolvedValueOnce(
      Response.json({ docs: [{ key: '/works/new', title: 'New' }] }),
    );
  const { result, rerender } = renderHook(
    ({ query }) => useBookSearch(query, true),
    { initialProps: { query: 'old' } },
  );
  await act(() => vi.advanceTimersByTimeAsync(500));
  rerender({ query: 'new' });
  expect(fetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(result.current.books[0]?.title).toBe('New');
  await act(async () => {
    resolveFirst(
      Response.json({ docs: [{ key: '/works/old', title: 'Old' }] }),
    );
  });
  expect(result.current.books[0]?.title).toBe('New');
  rerender({ query: 'other' });
  rerender({ query: 'new' });
  expect(result.current.books[0]?.title).toBe('New');
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('detail responses from a previous selection cannot appear on the next book', async () => {
  let resolveFirst: (response: Response) => void = () => {};
  const first = new Promise<Response>((resolve) => {
    resolveFirst = resolve;
  });
  vi.spyOn(globalThis, 'fetch')
    .mockReturnValueOnce(first)
    .mockResolvedValueOnce(
      Response.json({ description: { value: 'New description' } }),
    );
  const makeBook = (id: string): Book => ({ id, title: id, author: 'Author' });
  const { result, rerender } = renderHook(({ book }) => useBookDetails(book), {
    initialProps: { book: makeBook('/works/old') },
  });
  rerender({ book: makeBook('/works/new') });
  await waitFor(() =>
    expect(result.current.book?.description).toBe('New description'),
  );
  await act(async () => {
    resolveFirst(Response.json({ description: 'Old description' }));
  });
  expect(result.current.book?.description).toBe('New description');
  rerender({
    book: { ...makeBook('local'), description: 'Local description' },
  });
  expect(result.current.book?.description).toBe('Local description');
  expect(result.current.status).toBe('idle');
});

test('timed-out searches expose an error instead of staying in a loading state', async () => {
  vi.useFakeTimers();
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new Error('aborted')),
        );
      }),
  );
  const { result } = renderHook(() => useBookSearch('timeout', true));
  await act(() => vi.advanceTimersByTimeAsync(15_500));
  expect(result.current.status).toBe('error');
});
