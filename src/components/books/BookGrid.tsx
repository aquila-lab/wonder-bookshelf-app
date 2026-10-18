import type { Book } from '../../types/book';
import { BookCard } from './BookCard';
import { BookSkeleton } from './BookSkeleton';

export interface BookGridProps {
  books: Book[];
  savedIds: string[];
  loading?: boolean;
  onOpen: (book: Book) => void;
  onToggleSaved: (book: Book) => void;
}

export function BookGrid({
  books,
  savedIds,
  loading = false,
  onOpen,
  onToggleSaved,
}: BookGridProps) {
  return (
    <div className="books-grid" aria-busy={loading}>
      {loading
        ? Array.from({ length: 6 }, (_, index) => <BookSkeleton key={index} />)
        : books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              saved={savedIds.includes(book.id)}
              onOpen={onOpen}
              onToggleSaved={onToggleSaved}
            />
          ))}
    </div>
  );
}
