import type { Book, LibraryView } from '../../types/book';
import { BookListItem } from '../books';
import { Button, Icon } from '../ui';

export interface LibrarySidebarProps {
  view: LibraryView;
  bookCount: number;
  savedBooks: Book[];
  onNavigate: (view: LibraryView) => void;
  onOpenBook: (book: Book) => void;
}

export function LibrarySidebar({
  view,
  bookCount,
  savedBooks,
  onNavigate,
  onOpenBook,
}: LibrarySidebarProps) {
  return (
    <aside className="sidebar">
      <section className="library-nav">
        <h2>Your library</h2>
        <Button
          variant="ghost"
          className="side-link"
          aria-pressed={view === 'browse'}
          onClick={() => onNavigate('browse')}
        >
          <Icon name="grid" size="lg" />
          <span>All books</span>
          <small>{bookCount}</small>
        </Button>
        <Button
          variant="ghost"
          className="side-link"
          aria-pressed={view === 'saved'}
          onClick={() => onNavigate('saved')}
        >
          <Icon name="bookmark" size="lg" />
          <span>Want to read</span>
          <small>{savedBooks.length}</small>
        </Button>
      </section>
      <section className="up-next">
        <h2>Up next</h2>
        {savedBooks.slice(0, 2).map((book) => (
          <BookListItem key={book.id} book={book} onOpen={onOpenBook} />
        ))}
        {!savedBooks.length && (
          <p className="muted small">Save a book to start your reading list.</p>
        )}
      </section>
    </aside>
  );
}
