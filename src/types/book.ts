/** Shared data contract for cards, reading lists, and book details. */
export interface Book {
  id: string;
  title: string;
  author: string;
  displayTitle?: string;
  subtitle?: string;
  genre?: string;
  categories?: string[];
  cover?: string;
  description?: string;
  edition?: string;
  publisher?: string;
  published?: string;
  pages?: number;
  isbn?: string;
}

export interface LibraryState {
  books: Book[];
  saved: string[];
  storageError: boolean;
}

export type LibraryView = 'browse' | 'saved';
export type AsyncStatus = 'idle' | 'loading' | 'done' | 'error';
