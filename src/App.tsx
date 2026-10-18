import { useEffect, useRef, useState } from 'react';
import { AppHeader, BookDetails, LibrarySidebar, Toast } from './components';
import { CollectionView } from './features/library/CollectionView';
import { useBookDetails } from './hooks/useBookDetails';
import { useBookSearch } from './hooks/useBookSearch';
import { useHeaderHeight } from './hooks/useHeaderHeight';
import { useLibrary } from './hooks/useLibrary';
import { matchesBook, mergeBooks } from './lib/library';
import type { Book, LibraryView } from './types/book';

const defaultGenres = ['All books', 'Fiction', 'Nonfiction', 'Memoir'];

export function App() {
  const { library, savedBooks, storageError, save: toggleSaved } = useLibrary();
  const [view, setView] = useState<LibraryView>('browse');
  const [selected, setSelected] = useState<Book | null>(null);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All books');
  const [allGenres, setAllGenres] = useState(false);
  const [notice, setNotice] = useState('');
  const headerRef = useHeaderHeight();
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const search = useBookSearch(query, view === 'browse');
  const details = useBookDetails(selected);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3_000);
    return () => clearTimeout(timer);
  }, [notice]);

  function navigate(next: LibraryView) {
    setView(next);
    setSelected(null);
    setQuery('');
    setGenre('All books');
  }

  function openBook(book: Book) {
    setSelected(book);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => mainRef.current?.focus());
  }

  function save(book: Book) {
    setNotice(
      library.saved.includes(book.id)
        ? `Removed ${book.title} from your reading list`
        : `Added ${book.title} to your reading list`,
    );
    toggleSaved(book);
  }

  function startSearch() {
    navigate('browse');
    searchRef.current?.focus();
    setNotice('Search for a title or author to add a book.');
  }

  const localBooks = (view === 'saved' ? savedBooks : library.books).filter(
    (book) => matchesBook(book, trimmedQuery),
  );
  const books = mergeBooks(localBooks, search.books, genre);
  const availableGenres = library.books.flatMap(
    (book) => book.categories ?? (book.genre ? [book.genre] : []),
  );
  const genres = allGenres
    ? [...new Set([...defaultGenres, ...availableGenres])]
    : defaultGenres;

  return (
    <>
      <AppHeader
        headerRef={headerRef}
        searchRef={searchRef}
        view={view}
        query={query}
        onNavigate={navigate}
        onQueryChange={(value) => {
          setQuery(value);
          setSelected(null);
          setGenre('All books');
        }}
        onSearchSubmit={() => setSelected(null)}
        onAddBook={startSearch}
      />
      <div className="workspace">
        <LibrarySidebar
          view={view}
          bookCount={library.books.length}
          savedBooks={savedBooks}
          onNavigate={navigate}
          onOpenBook={openBook}
        />
        <main
          ref={mainRef}
          tabIndex={-1}
          className={selected ? 'detail-content' : 'collection'}
        >
          {storageError && (
            <p className="storage-warning" role="status">
              Browser storage is unavailable. Your reading list will last for
              this visit only.
            </p>
          )}
          {details.book ? (
            <BookDetails
              book={details.book}
              saved={library.saved.includes(details.book.id)}
              descriptionStatus={details.status}
              backLabel={view === 'saved' ? 'My reading list' : 'All books'}
              onBack={() => setSelected(null)}
              onToggleSaved={save}
            />
          ) : (
            <CollectionView
              view={view}
              query={trimmedQuery}
              books={books}
              savedBooks={savedBooks}
              savedIds={library.saved}
              genre={genre}
              genres={genres}
              allGenres={allGenres}
              searchStatus={search.status}
              onGenreChange={setGenre}
              onToggleGenres={() => setAllGenres((value) => !value)}
              onRetrySearch={search.retry}
              onOpenBook={openBook}
              onToggleSaved={save}
              onNavigate={navigate}
            />
          )}
        </main>
      </div>
      <Toast message={notice} />
    </>
  );
}
