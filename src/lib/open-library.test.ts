import { expect, test, vi } from 'vitest';
import {
  fetchBookDescription,
  normalizeBook,
  searchBooks,
} from './open-library';

test('search handles missing metadata and memoirs', () => {
  expect(normalizeBook({ key: '/works/1', title: 'Book' }).author).toBe(
    'Unknown author',
  );
  expect(
    normalizeBook({
      key: '/works/2',
      title: 'Book',
      subject: ['Autobiography'],
    }).genre,
  ).toBe('Memoir');
});

test('search encodes the query, limits results, forwards cancellation, and skips unusable records', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json({
      docs: [
        { key: '/works/1', title: 'One' },
        { title: 'No ID' },
        { key: 1, title: 'Wrong ID type' },
      ],
    }),
  );
  const controller = new AbortController();
  const results = await searchBooks('food & culture', controller.signal);
  const request = fetch.mock.calls[0];
  if (!request) throw new Error('No request was made');
  const url = new URL(String(request[0]));
  expect(url.searchParams.get('q')).toBe('food & culture');
  expect(url.searchParams.get('limit')).toBe('24');
  expect(request[1]?.signal).toBe(controller.signal);
  expect(results).toHaveLength(1);
});

test('malformed search metadata cannot escape the API boundary', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json({
      docs: [
        null,
        {
          key: '/works/1',
          title: 'One',
          subject: ['Fiction', null],
          author_name: 'not-an-array',
          cover_i: {},
          first_publish_year: [],
        },
      ],
    }),
  );
  expect(await searchBooks('one')).toEqual([
    {
      id: '/works/1',
      title: 'One',
      author: 'Unknown author',
      cover: '',
      genre: 'Fiction',
      categories: ['Fiction'],
      published: undefined,
    },
  ]);
});

test('search surfaces upstream failures', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(null, { status: 503 }),
  );
  await expect(searchBooks('test')).rejects.toThrow('Search unavailable');
});

test.each(['A description', { value: 'A description' }])(
  'descriptions accept either API representation: %j',
  async (description) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ description }),
    );
    expect(
      await fetchBookDescription('/works/1', new AbortController().signal),
    ).toBe('A description');
  },
);
