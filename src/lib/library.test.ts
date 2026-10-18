import { expect, test } from 'vitest';
import { initialBooks } from '../data/initialBooks';
import type { Book } from '../types/book';
import { matchesBook, mergeBooks, readLibrary, toggleSaved } from './library';

test('saved search results persist without duplicate books or IDs', () => {
  const book: Book = {
    id: '/works/OL123W',
    title: 'A new book',
    author: 'An author',
  };
  const empty = readLibrary({ getItem: () => null });
  const added = toggleSaved(empty, book);
  const restored = readLibrary({ getItem: () => JSON.stringify(added) });
  expect(restored.saved).toContain(book.id);
  expect(restored.books.find((item) => item.id === book.id)?.title).toBe(
    book.title,
  );
  const removed = toggleSaved(restored, book);
  expect(removed.saved).not.toContain(book.id);
  expect(
    toggleSaved(removed, book).books.filter((item) => item.id === book.id),
  ).toHaveLength(1);
});

test('empty reading lists stay empty on reload', () => {
  expect(
    readLibrary({
      getItem: () => JSON.stringify({ books: initialBooks, saved: [] }),
    }).saved,
  ).toEqual([]);
});

test('invalid or blocked storage falls back safely', () => {
  for (const getItem of [
    () => '{broken',
    () => {
      throw new Error('SecurityError');
    },
    () => JSON.stringify({ books: [], saved: 'invalid' }),
  ]) {
    const state = readLibrary({ getItem });
    expect(state.books).toHaveLength(6);
    expect(state.storageError).toBe(true);
  }
});

test('invalid books and dangling saved IDs are discarded', () => {
  const state = readLibrary({
    getItem: () =>
      JSON.stringify({
        books: [null, {}, { id: 123 }],
        saved: ['unknown', 'creative-act', 'creative-act', null],
      }),
  });
  expect(state.saved).toEqual(['creative-act']);
});

test('invalid optional metadata is discarded before reaching components', () => {
  const state = readLibrary({
    getItem: () =>
      JSON.stringify({
        books: [
          {
            id: 'custom',
            title: 'Custom',
            author: 'Author',
            description: {},
            cover: 1,
            categories: ['Fiction', 123],
            genre: ['Fiction'],
          },
        ],
        saved: ['custom'],
      }),
  });
  expect(state.books.find((book) => book.id === 'custom')).toEqual({
    id: 'custom',
    title: 'Custom',
    author: 'Author',
    categories: ['Fiction'],
  });
});

test('search matches title and author regardless of casing or whitespace', () => {
  const book = initialBooks.find((book) => book.id === 'atomic-habits');
  expect(book).toBeDefined();
  if (!book) throw new Error('Missing seed book');
  expect(matchesBook(book, '  JAMES CLEAR ')).toBe(true);
  expect(matchesBook(book, 'ATOMIC')).toBe(true);
});

test('local and online results merge without duplicate titles and respect category filters', () => {
  const local: Book = {
    id: 'local',
    title: 'Creative Work',
    author: 'An Author',
    genre: 'Nonfiction',
    categories: ['Creativity'],
  };
  const remote: Book = {
    id: '/works/1',
    title: 'creative work',
    author: 'AN AUTHOR',
    genre: 'Nonfiction',
  };
  expect(mergeBooks([local], [remote], 'All books')).toEqual([local]);
  expect(mergeBooks([local], [], 'Creativity')).toEqual([local]);
  expect(mergeBooks([local], [], 'Fiction')).toEqual([]);
});
