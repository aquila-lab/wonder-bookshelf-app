import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { readLibrary, toggleSaved, matchesBook, searchBooks } from './books';

function Icon({ name, size = 20 }) {
  const paths = { plus: <path d="M10 4v12M4 10h12" />, check: <path d="m4 10 4 4 8-10" />, search: <><circle cx="8.5" cy="8.5" r="5" /><path d="m12.5 12.5 4 4" /></>, arrow: <path d="M3 10h13m-5-5 5 5-5 5" />, back: <path d="m12 5-5 5 5 5" />, down: <path d="m5 8 5 5 5-5" />, close: <path d="m5 5 10 10M15 5 5 15" />, bookmark: <path d="M5 3h10v15l-5-4-5 4V3Z" />, grid: <><rect x="4" y="4" width="5" height="5" rx="1"/><rect x="11" y="4" width="5" height="5" rx="1"/><rect x="4" y="11" width="5" height="5" rx="1"/><rect x="11" y="11" width="5" height="5" rx="1"/></> };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
function Cover({ book, className = '' }) {
  const [failed, setFailed] = useState(false);
  return book.cover && !failed ? <img className={`cover ${className}`} src={book.cover} alt={`${book.title} cover`} onError={() => setFailed(true)} /> : <div className={`cover cover-fallback ${className}`}><span>{book.title}</span><small>{book.author}</small></div>;
}
function BookSkeleton() {
  return <div className="book-card book-skeleton" aria-hidden="true">
    <div className="cover-area skeleton-surface" />
    <div className="card-text skeleton-text">
      <div className="skeleton-author"><span className="skeleton-surface" /></div>
      <div className="skeleton-title"><span className="skeleton-surface" /></div>
      <div className="skeleton-genre"><span className="skeleton-surface" /></div>
    </div>
  </div>;
}
function App() {
  const [library, setLibrary] = useState(() => readLibrary({ getItem: key => window.localStorage.getItem(key) }));
  const [storageError, setStorageError] = useState(library.storageError);
  const [view, setView] = useState('browse');
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All books');
  const [allGenres, setAllGenres] = useState(false);
  const [searchResult, setSearchResult] = useState({ query: '', books: [], status: 'idle' });
  const [retry, setRetry] = useState(0);
  const [notice, setNotice] = useState('');
  const [details, setDetails] = useState(null);
  const [detailStatus, setDetailStatus] = useState('idle');
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const mainRef = useRef(null);
  const cache = useRef(new Map());
  const trimmedQuery = query.trim();
  const onlineSearch = Boolean(trimmedQuery) && view === 'browse';
  const currentSearch = searchResult.query === trimmedQuery ? searchResult : null;
  const cachedBooks = cache.current.get(trimmedQuery);
  const status = !onlineSearch ? 'idle' : cachedBooks ? 'done' : currentSearch?.status || 'loading';
  const remote = onlineSearch ? cachedBooks || currentSearch?.books || [] : [];
  const isSearching = status === 'loading';
  useEffect(() => {
    const header = headerRef.current;
    const updateHeight = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--header-height'); };
  }, []);
  const savedBooks = library.saved.map(id => library.books.find(b => b.id === id)).filter(Boolean);
  useEffect(() => {
    try { localStorage.setItem('bookshelf-library-v1', JSON.stringify({ books: library.books, saved: library.saved })); setStorageError(false); }
    catch { setStorageError(true); }
  }, [library]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!onlineSearch || cache.current.has(trimmedQuery)) return;
    const controller = new AbortController();
    let timeout;
    setSearchResult({ query: trimmedQuery, books: [], status: 'loading' });
    const timer = setTimeout(async () => {
      timeout = setTimeout(() => controller.abort('timeout'), 15000);
      try {
        const books = await searchBooks(trimmedQuery, controller.signal);
        if (!controller.signal.aborted) {
          cache.current.set(trimmedQuery, books);
          setSearchResult({ query: trimmedQuery, books, status: 'done' });
        }
      } catch {
        if (!controller.signal.aborted || controller.signal.reason === 'timeout') {
          setSearchResult({ query: trimmedQuery, books: [], status: 'error' });
        }
      } finally { clearTimeout(timeout); }
    }, 500);
    return () => { clearTimeout(timer); clearTimeout(timeout); controller.abort(); };
  }, [trimmedQuery, onlineSearch, retry]);
  useEffect(() => {
    setDetails(null);
    if (!selected?.id.startsWith('/works/')) { setDetailStatus('idle'); return; }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    setDetailStatus('loading');
    fetch(`https://openlibrary.org${selected.id}.json`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setDetails({ description: typeof data.description === 'string' ? data.description : data.description?.value }); setDetailStatus('done'); })
      .catch(() => { if (!controller.signal.aborted) setDetailStatus('error'); })
      .finally(() => { clearTimeout(timeout); if (controller.signal.reason?.name === 'AbortError') setDetailStatus('error'); });
    return () => { clearTimeout(timeout); controller.abort('cleanup'); };
  }, [selected?.id]);
  function navigate(next) { setView(next); setSelected(null); setQuery(''); setGenre('All books'); }
  function openBook(book) { setSelected(book); window.scrollTo({ top: 0 }); requestAnimationFrame(() => mainRef.current?.focus()); }
  function save(book) {
    setNotice(library.saved.includes(book.id) ? `Removed ${book.title} from your reading list` : `Added ${book.title} to your reading list`);
    setLibrary(current => toggleSaved(current, book));
  }
  function startSearch() { navigate('browse'); searchRef.current?.focus(); setNotice('Search for a title or author to add a book.'); }
  const localBooks = (view === 'saved' ? savedBooks : library.books).filter(book => matchesBook(book, trimmedQuery));
  const books = [...localBooks, ...remote.filter(book => !localBooks.some(local => local.id === book.id || (local.title.toLowerCase() === book.title.toLowerCase() && local.author.toLowerCase() === book.author.toLowerCase())))].filter(book => genre === 'All books' || book.genre === genre || book.categories?.includes(genre));
  const availableGenres = [...new Set(library.books.flatMap(book => book.categories || [book.genre]).filter(Boolean))];
  const genres = allGenres ? ['All books', ...new Set(['Fiction', 'Nonfiction', 'Memoir', ...availableGenres])] : ['All books', 'Fiction', 'Nonfiction', 'Memoir'];
  const currentBook = selected ? { ...selected, ...details } : null;
  const isSaved = selected && library.saved.includes(selected.id);
  return <>
    <header ref={headerRef} className="topbar">
      <a className="brand" href="#" aria-label="Bookshelf home" onClick={e => { e.preventDefault(); navigate('browse'); }}><svg aria-hidden="true" width="26" height="26" viewBox="0 0 40 40" fill="currentColor"><path d="M24 0H16V12.0632C15.9663 14.2434 14.1885 16 12.0005 16H0V24H8.68629C10.808 24 12.8429 23.1571 14.3431 21.6569L21.6569 14.3431C23.1571 12.8429 24 10.808 24 8.68629V0ZM16 40H24V27.9368C24.0337 25.7566 25.8115 24 27.9995 24H40V16H31.3137C29.192 16 27.1571 16.8429 25.6569 18.3431L18.3431 25.6569C16.8429 27.1571 16 29.192 16 31.3137V40Z"/></svg></a>
      <nav aria-label="Main navigation"><button className={view === 'browse' ? 'active' : ''} onClick={() => navigate('browse')}>Browse</button><button className={view === 'saved' ? 'active' : ''} onClick={() => navigate('saved')}>My reading list</button></nav>
      <form className="search" role="search" onSubmit={e => { e.preventDefault(); setSelected(null); }}><Icon name="search"/><input ref={searchRef} aria-label="Search books or authors" placeholder="Search books or authors" value={query} onChange={e => { setQuery(e.target.value); setSelected(null); setGenre('All books'); }}/><button type="button" className="clear-search" disabled={!query} aria-hidden={!query} aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><Icon name="close" size={16}/></button></form>
      <button className="pill primary add-book" onClick={startSearch}><Icon name="plus"/><span>Add book</span></button>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <section className="library-nav"><h2>Your library</h2><button className={`side-link ${view === 'browse' ? 'selected' : ''}`} aria-pressed={view === 'browse'} onClick={() => navigate('browse')}><Icon name="grid" size={24}/><span>All books</span><small>{library.books.length}</small></button><button className={`side-link ${view === 'saved' ? 'selected' : ''}`} aria-pressed={view === 'saved'} onClick={() => navigate('saved')}><Icon name="bookmark" size={24}/><span>Want to read</span><small>{savedBooks.length}</small></button></section>
        <section className="up-next"><h2>Up next</h2>{savedBooks.slice(0, 2).map(book => <button className="mini-book" key={book.id} onClick={() => openBook(book)}><Cover book={book}/><span><strong>{book.title}</strong><small>{book.author}</small></span></button>)}{!savedBooks.length && <p className="muted small">Save a book to start your reading list.</p>}</section>
      </aside>
      <main ref={mainRef} tabIndex={-1} className={selected ? 'detail-content' : 'collection'}>
        {storageError && <p className="storage-warning" role="status">Browser storage is unavailable. Your reading list will last for this visit only.</p>}
        {currentBook ? <>
          <button className="back" onClick={() => { setSelected(null); }}><Icon name="back"/>{view === 'saved' ? 'My reading list' : 'All books'}</button>
          <div className="book-overview"><div className="cover-column"><Cover book={currentBook}/>{currentBook.edition && <p className="muted small">{currentBook.edition}</p>}</div>
            <div className="book-information"><div className="title-group"><p className="muted">{currentBook.author}</p><h1>{currentBook.title}</h1>{currentBook.subtitle && <p className="subtitle">{currentBook.subtitle}</p>}</div>
              <div className="categories">{(currentBook.categories || [currentBook.genre]).filter(Boolean).map(category => <span className="pill" key={category}>{category}</span>)}</div>
              <div className="save-control">
                {isSaved ? <div className="native-save-select">
                  <span className="pill primary save-detail" aria-hidden="true"><Icon name="check"/>On your reading list<Icon name="down"/></span>
                  <select aria-label="Reading list status" value="saved" onChange={event => { if (event.target.value === 'remove') save(currentBook); }}>
                    <option value="saved">On your reading list</option>
                    <option value="remove">Remove from reading list</option>
                  </select>
                </div> : <button className="pill primary save-detail" onClick={() => save(currentBook)}><Icon name="plus"/>Add to reading list</button>}
              </div>
              <section className="about"><h2>About this book</h2>{currentBook.description ? currentBook.description.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>{detailStatus === 'loading' ? 'Loading book description…' : detailStatus === 'error' ? 'The description could not be loaded. You can still save this book.' : 'No description is available for this book.'}</p>}</section>
            </div></div>
          <section className="book-facts"><h2>Book details</h2><dl>{[['Publisher', currentBook.publisher], ['Published', currentBook.published], ['Length', currentBook.pages ? `${currentBook.pages} pages` : null], ['ISBN', currentBook.isbn]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not available'}</dd></div>)}</dl></section>
        </> : <>
          <section className="collection-header"><div><h1>{trimmedQuery ? 'Search results' : view === 'saved' ? 'My reading list' : 'Find your next chapter.'}</h1><p className="muted">{trimmedQuery ? `Books and authors matching “${trimmedQuery}”` : view === 'saved' ? 'A little inspiration for your next chapter.' : 'Browse the collection. Save something for later.'}</p></div>
            <div className="filters"><div className="genre-buttons">{genres.map(value => <button key={value} className={`pill ${genre === value ? 'primary' : ''}`} aria-pressed={genre === value} onClick={() => setGenre(value)}>{value}</button>)}</div><button className="text-link" onClick={() => setAllGenres(!allGenres)} aria-expanded={allGenres}>{allGenres ? 'Show fewer genres' : 'View all genres'}<Icon name="arrow"/></button></div>
          </section>
          <section className="results-region" aria-label={trimmedQuery ? 'Search results' : 'Books'}>
            {trimmedQuery && <div className="search-status" role="status">{isSearching ? 'Searching Open Library…' : status === 'error' ? <>Online search unavailable. <button onClick={() => setRetry(r => r + 1)}>Try again</button></> : `${books.length} ${books.length === 1 ? 'book' : 'books'} found`}</div>}
            <div className="books-grid" aria-busy={isSearching}>{isSearching ? Array.from({ length: 6 }, (_, index) => <BookSkeleton key={index}/>) : books.map(book => <article className="book-card" key={book.id}><div className="cover-area"><button className="cover-link" aria-label={`View ${book.title}`} onClick={() => openBook(book)}><Cover book={book}/></button><button className="save-book" aria-label={`${library.saved.includes(book.id) ? 'Remove' : 'Add'} ${book.title} ${library.saved.includes(book.id) ? 'from' : 'to'} reading list`} aria-pressed={library.saved.includes(book.id)} onClick={() => save(book)}><Icon name={library.saved.includes(book.id) ? 'check' : 'plus'} size={16}/></button></div><div className="card-text"><p>{book.author}</p><button title={book.title} onClick={() => openBook(book)}>{book.displayTitle || book.title}</button><span>{book.genre}</span></div></article>)}</div>
            {!books.length && !isSearching && <div className="empty"><h2>{view === 'saved' && !trimmedQuery ? 'Your next chapter starts here.' : 'No books found.'}</h2><p>{view === 'saved' && !trimmedQuery ? 'Save a book with the + button and it will appear here.' : 'Try a different title, author, or genre.'}</p>{view === 'saved' && <button className="pill primary" onClick={() => navigate('browse')}>Browse books</button>}</div>}
          </section>
          {view === 'browse' && !trimmedQuery && <section className="next-reads"><div className="section-heading"><h2>Your next reads</h2><button className="text-link" onClick={() => navigate('saved')}>View reading list<Icon name="arrow"/></button></div><div className="reading-row">{savedBooks.slice(0, 3).map(book => <button className="reading-book" key={book.id} onClick={() => openBook(book)}><Cover book={book}/><span className="reading-text"><small>{book.author}</small><strong>{book.title}</strong><span>{book.description?.split('\n')[0] || 'Saved to your reading list.'}</span></span></button>)}</div>{!savedBooks.length && <p className="muted small">Save a book with the + button to find it here.</p>}</section>}
        </>}
      </main>
    </div>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice}</div>
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
