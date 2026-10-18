import type { AsyncStatus, Book } from '../../types/book';
import { Badge, Button } from '../ui';
import { BookCover } from './BookCover';
import { ReadingListButton } from './ReadingListButton';

export interface BookDetailsProps {
  book: Book;
  saved: boolean;
  descriptionStatus?: AsyncStatus;
  backLabel?: string;
  onBack: () => void;
  onToggleSaved: (book: Book) => void;
}

export function BookDetails({
  book,
  saved,
  descriptionStatus = 'idle',
  backLabel = 'All books',
  onBack,
  onToggleSaved,
}: BookDetailsProps) {
  const categories = book.categories ?? (book.genre ? [book.genre] : []);
  const facts = [
    ['Publisher', book.publisher],
    ['Published', book.published],
    ['Length', book.pages ? `${book.pages} pages` : undefined],
    ['ISBN', book.isbn],
  ];

  return (
    <>
      <Button
        variant="ghost"
        className="back"
        startIcon="back"
        onClick={onBack}
      >
        {backLabel}
      </Button>
      <div className="book-overview">
        <div className="cover-column">
          <BookCover book={book} />
          {book.edition && <p className="muted small">{book.edition}</p>}
        </div>
        <div className="book-information">
          <div className="title-group">
            <p className="muted">{book.author}</p>
            <h1>{book.title}</h1>
            {book.subtitle && <p className="subtitle">{book.subtitle}</p>}
          </div>
          <div className="categories">
            {categories.map((category) => (
              <Badge key={category}>{category}</Badge>
            ))}
          </div>
          <ReadingListButton
            saved={saved}
            onToggleSaved={() => onToggleSaved(book)}
          />
          <section className="about">
            <h2>About this book</h2>
            {book.description ? (
              book.description
                .split('\n')
                .filter(Boolean)
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p>
                {descriptionStatus === 'loading'
                  ? 'Loading book description…'
                  : descriptionStatus === 'error'
                    ? 'The description could not be loaded. You can still save this book.'
                    : 'No description is available for this book.'}
              </p>
            )}
          </section>
        </div>
      </div>
      <section className="book-facts">
        <h2>Book details</h2>
        <dl>
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || 'Not available'}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
