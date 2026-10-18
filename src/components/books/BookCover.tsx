import { useState } from 'react';
import { classNames } from '../../lib/classNames';
import type { Book } from '../../types/book';

export interface BookCoverProps {
  book: Pick<Book, 'title' | 'author' | 'cover'>;
  className?: string;
}

export function BookCover({ book, className }: BookCoverProps) {
  const [failedSource, setFailedSource] = useState<string>();
  return book.cover && failedSource !== book.cover ? (
    <img
      className={classNames('cover', className)}
      src={book.cover}
      alt={`${book.title} cover`}
      onError={() => setFailedSource(book.cover)}
    />
  ) : (
    <div
      className={classNames('cover', 'cover-fallback', className)}
      role="img"
      aria-label={`${book.title} cover`}
    >
      <span>{book.title}</span>
      <small>{book.author}</small>
    </div>
  );
}
