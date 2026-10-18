import type { Book } from '../../types/book';
import { BookCover } from './BookCover';

export interface BookListItemProps {
  book: Book;
  variant?: 'compact' | 'summary';
  onOpen: (book: Book) => void;
}

export function BookListItem({
  book,
  variant = 'compact',
  onOpen,
}: BookListItemProps) {
  return (
    <button
      type="button"
      className={variant === 'compact' ? 'mini-book' : 'reading-book'}
      onClick={() => onOpen(book)}
    >
      <BookCover book={book} />
      {variant === 'compact' ? (
        <span>
          <strong>{book.title}</strong>
          <small>{book.author}</small>
        </span>
      ) : (
        <span className="reading-text">
          <small>{book.author}</small>
          <strong>{book.title}</strong>
          <span>
            {book.description?.split('\n')[0] || 'Saved to your reading list.'}
          </span>
        </span>
      )}
    </button>
  );
}
