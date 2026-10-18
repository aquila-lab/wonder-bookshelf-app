import { useEffect, useState } from 'react';
import { readLibrary, STORAGE_KEY, toggleSaved } from '../lib/library';
import type { Book } from '../types/book';

export function useLibrary() {
  const [library, setLibrary] = useState(() =>
    readLibrary({ getItem: (key) => window.localStorage.getItem(key) }),
  );
  const [storageError, setStorageError] = useState(library.storageError);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ books: library.books, saved: library.saved }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [library]);

  const savedBooks = library.saved
    .map((id) => library.books.find((book) => book.id === id))
    .filter((book): book is Book => book !== undefined);

  return {
    library,
    savedBooks,
    storageError,
    save: (book: Book) => setLibrary((current) => toggleSaved(current, book)),
  };
}
