import { initialBooks } from '../data/initialBooks';
import type { Book, LibraryState } from '../types/book';
import { isRecord, stringArray } from './guards';

// Keep the existing key and shape so installed demos retain their reading lists.
export const STORAGE_KEY = 'bookshelf-library-v1';

function parseStoredBook(value: unknown): Book | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.author !== 'string'
  ) {
    return null;
  }

  const book: Book = { id: value.id, title: value.title, author: value.author };
  const textFields = [
    'displayTitle',
    'subtitle',
    'genre',
    'cover',
    'description',
    'edition',
    'publisher',
    'published',
    'isbn',
  ] as const;
  for (const key of textFields) {
    if (typeof value[key] === 'string') book[key] = value[key];
  }
  if (Array.isArray(value.categories))
    book.categories = stringArray(value.categories);
  if (typeof value.pages === 'number' && Number.isFinite(value.pages))
    book.pages = value.pages;
  return book;
}

export function readLibrary(storage: Pick<Storage, 'getItem'>): LibraryState {
  const fallback: LibraryState = {
    books: [...initialBooks],
    saved: ['creative-act', 'midnight-library'],
    storageError: false,
  };

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      !Array.isArray(parsed.books) ||
      !Array.isArray(parsed.saved)
    ) {
      throw new Error('Invalid library');
    }
    const byId = new Map(initialBooks.map((book) => [book.id, book]));
    for (const value of parsed.books) {
      const book = parseStoredBook(value);
      if (book && !byId.has(book.id)) byId.set(book.id, book);
    }
    return {
      books: [...byId.values()],
      saved: [...new Set(stringArray(parsed.saved))].filter((id) =>
        byId.has(id),
      ),
      storageError: false,
    };
  } catch {
    return { ...fallback, storageError: true };
  }
}

export function toggleSaved(library: LibraryState, book: Book): LibraryState {
  return {
    ...library,
    books: library.books.some((item) => item.id === book.id)
      ? library.books
      : [...library.books, book],
    saved: library.saved.includes(book.id)
      ? library.saved.filter((id) => id !== book.id)
      : [...library.saved, book.id],
  };
}

export function matchesBook(book: Book, query: string): boolean {
  return `${book.title} ${book.author}`
    .toLocaleLowerCase()
    .includes(query.trim().toLocaleLowerCase());
}

export function mergeBooks(
  local: Book[],
  remote: Book[],
  genre: string,
): Book[] {
  return [
    ...local,
    ...remote.filter(
      (book) =>
        !local.some(
          (item) =>
            item.id === book.id ||
            (item.title.toLowerCase() === book.title.toLowerCase() &&
              item.author.toLowerCase() === book.author.toLowerCase()),
        ),
    ),
  ].filter(
    (book) =>
      genre === 'All books' ||
      book.genre === genre ||
      book.categories?.includes(genre),
  );
}
