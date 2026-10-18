import type { Ref } from 'react';
import type { LibraryView } from '../../types/book';
import { BrandMark, Button, SearchField } from '../ui';

export interface AppHeaderProps {
  view: LibraryView;
  query: string;
  onNavigate: (view: LibraryView) => void;
  onQueryChange: (query: string) => void;
  onSearchSubmit: () => void;
  onAddBook: () => void;
  headerRef?: Ref<HTMLElement>;
  searchRef?: Ref<HTMLInputElement>;
}

export function AppHeader({
  view,
  query,
  onNavigate,
  onQueryChange,
  onSearchSubmit,
  onAddBook,
  headerRef,
  searchRef,
}: AppHeaderProps) {
  return (
    <header ref={headerRef} className="topbar">
      <a
        className="brand"
        href="#"
        aria-label="Bookshelf home"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('browse');
        }}
      >
        <BrandMark />
      </a>
      <nav aria-label="Main navigation">
        <Button
          variant="ghost"
          className="nav-link"
          aria-current={view === 'browse' ? 'page' : undefined}
          onClick={() => onNavigate('browse')}
        >
          Browse
        </Button>
        <Button
          variant="ghost"
          className="nav-link"
          aria-current={view === 'saved' ? 'page' : undefined}
          onClick={() => onNavigate('saved')}
        >
          My reading list
        </Button>
      </nav>
      <SearchField
        inputRef={searchRef}
        value={query}
        onValueChange={onQueryChange}
        onSubmit={onSearchSubmit}
      />
      <Button
        className="add-book"
        variant="primary"
        size="md"
        startIcon="plus"
        aria-label="Add book"
        onClick={onAddBook}
      >
        <span>Add book</span>
      </Button>
    </header>
  );
}
