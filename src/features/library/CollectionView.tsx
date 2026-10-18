import type { AsyncStatus, Book, LibraryView } from '../../types/book';
import {
  BookGrid,
  BookListItem,
  Button,
  EmptyState,
  GenreFilter,
} from '../../components';
import './collection.css';

export interface CollectionViewProps {
  view: LibraryView;
  query: string;
  books: Book[];
  savedBooks: Book[];
  savedIds: string[];
  genre: string;
  genres: string[];
  allGenres: boolean;
  searchStatus: AsyncStatus;
  onGenreChange: (genre: string) => void;
  onToggleGenres: () => void;
  onRetrySearch: () => void;
  onOpenBook: (book: Book) => void;
  onToggleSaved: (book: Book) => void;
  onNavigate: (view: LibraryView) => void;
}

export function CollectionView({
  view,
  query,
  books,
  savedBooks,
  savedIds,
  genre,
  genres,
  allGenres,
  searchStatus,
  onGenreChange,
  onToggleGenres,
  onRetrySearch,
  onOpenBook,
  onToggleSaved,
  onNavigate,
}: CollectionViewProps) {
  const loading = searchStatus === 'loading';
  const emptyReadingList = view === 'saved' && !query;

  return (
    <>
      <section className="collection-header">
        <div>
          <h1>
            {query
              ? 'Search results'
              : view === 'saved'
                ? 'My reading list'
                : 'Find your next chapter.'}
          </h1>
          <p className="muted">
            {query
              ? `Books and authors matching “${query}”`
              : view === 'saved'
                ? 'A little inspiration for your next chapter.'
                : 'Browse the collection. Save something for later.'}
          </p>
        </div>
        <GenreFilter
          genres={genres}
          value={genre}
          expanded={allGenres}
          onValueChange={onGenreChange}
          onToggleExpanded={onToggleGenres}
        />
      </section>
      <section
        className="results-region"
        aria-label={query ? 'Search results' : 'Books'}
      >
        {query && (
          <div className="search-status" role="status">
            {loading ? (
              'Searching Open Library…'
            ) : searchStatus === 'error' ? (
              <>
                Online search unavailable.{' '}
                <Button variant="link" onClick={onRetrySearch}>
                  Try again
                </Button>
              </>
            ) : (
              `${books.length} ${books.length === 1 ? 'book' : 'books'} found`
            )}
          </div>
        )}
        <BookGrid
          books={books}
          savedIds={savedIds}
          loading={loading}
          onOpen={onOpenBook}
          onToggleSaved={onToggleSaved}
        />
        {!books.length && !loading && (
          <EmptyState
            title={
              emptyReadingList
                ? 'Your next chapter starts here.'
                : 'No books found.'
            }
            description={
              emptyReadingList
                ? 'Save a book with the + button and it will appear here.'
                : 'Try a different title, author, or genre.'
            }
            action={
              view === 'saved' && (
                <Button variant="primary" onClick={() => onNavigate('browse')}>
                  Browse books
                </Button>
              )
            }
          />
        )}
      </section>
      {view === 'browse' && !query && (
        <section className="next-reads">
          <div className="section-heading">
            <h2>Your next reads</h2>
            <Button
              variant="link"
              endIcon="arrow"
              onClick={() => onNavigate('saved')}
            >
              View reading list
            </Button>
          </div>
          <div className="reading-row">
            {savedBooks.slice(0, 3).map((book) => (
              <BookListItem
                key={book.id}
                book={book}
                variant="summary"
                onOpen={onOpenBook}
              />
            ))}
          </div>
          {!savedBooks.length && (
            <p className="muted small">
              Save a book with the + button to find it here.
            </p>
          )}
        </section>
      )}
    </>
  );
}
