import type { Book } from '../../types/book';
import { IconButton } from '../ui';
import { BookCover } from './BookCover';

export interface BookCardProps {
  book: Book;
  saved?: boolean;
  onOpen: (book: Book) => void;
  onToggleSaved: (book: Book) => void;
}

export function BookCard({
  book,
  saved = false,
  onOpen,
  onToggleSaved,
}: BookCardProps) {
  return (
    <article className="book-card">
      <div className="cover-area">
        <button
          type="button"
          className="cover-link"
          aria-label={`View ${book.title}`}
          onClick={() => onOpen(book)}
        >
          <BookCover book={book} />
        </button>
        <IconButton
          className="save-book"
          icon={saved ? 'check' : 'plus'}
          aria-label={`${saved ? 'Remove' : 'Add'} ${book.title} ${saved ? 'from' : 'to'} reading list`}
          aria-pressed={saved}
          onClick={() => onToggleSaved(book)}
        />
      </div>
      <div className="card-text">
        <p>{book.author}</p>
        <button type="button" title={book.title} onClick={() => onOpen(book)}>
          {book.displayTitle || book.title}
        </button>
        <span>{book.genre}</span>
      </div>
    </article>
  );
}
