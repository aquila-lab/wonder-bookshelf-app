# Bookshelf

> **Purpose:** A sample app for onboarding to Wonder: import a real component and token foundation, change a design, and bring it back to the same source components. No account, API key, or backend is needed.

Built with React 19, strict TypeScript, and Vite. The UI is composed from reusable, typed components; its light/dark colors, typography, spacing, dimensions, borders, shadows, and motion live in a shared token file.

## Getting started

Use Node **22.12 or newer**, then install dependencies with `npm ci`. In Wonder, open the app Preview to run the managed development server. The `dev` script uses Vite's default port, 5173, and React Fast Refresh updates components as you edit them.

| Command              | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `npm run check`      | Formatting, tests, TypeScript, and production build                           |
| `npm run typecheck`  | Strict type checking, including tests                                         |
| `npm test`           | Data, request lifecycle, component, app interaction, and token contract tests |
| `npm run test:watch` | Run tests while editing                                                       |
| `npm run build`      | Type-check and create a static site in `dist`                                 |
| `npm run format`     | Format source and documentation                                               |

## Component and token entry points

Start with the [design system and Wonder import guide](docs/design-system.md), which maps components, variants, tokens, icons, and demo data to their source files.

| Source                                                                               | Responsibility                                                         |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [`src/design-system/tokens.css`](src/design-system/tokens.css)                       | Canonical token values and light/dark themes                           |
| [`src/design-system/tokens.ts`](src/design-system/tokens.ts)                         | Typed CSS variable references for React styles                         |
| [`src/components/index.ts`](src/components/index.ts)                                 | Public component exports and prop types                                |
| `src/components/ui/`                                                                 | Buttons, icons, badges, search, empty states, and toast                |
| `src/components/books/`                                                              | Book covers, cards, grids, details, filters, and reading-list controls |
| `src/components/layout/`                                                             | Header and library sidebar                                             |
| [`src/features/library/CollectionView.tsx`](src/features/library/CollectionView.tsx) | Collection screen composition                                          |
| `src/hooks/`                                                                         | Storage, debounced search, description loading, header measurement     |
| `src/lib/`                                                                           | Validated storage/API boundaries and pure data helpers                 |
| [`src/types/book.ts`](src/types/book.ts)                                             | Shared book, library, and request-state types                          |
| [`src/data/initialBooks.ts`](src/data/initialBooks.ts)                               | Six offline demo books                                                 |
| [`src/App.tsx`](src/App.tsx)                                                         | Application state and navigation                                       |

## Using the app

- Browse the six starting books and filter by genre.
- Search titles or authors through Open Library, or search just your saved books from My reading list.
- Open a cover for book details. Use + to save; use the saved button to remove.
- Add book focuses the search field. Saving a search result adds it to your collection.
- Your collection and reading list are stored in this browser's localStorage under the existing `bookshelf-library-v1` key. They do not sync between devices. When storage is blocked, changes last only for the current visit.

The original book covers and Inter Variable font are bundled locally. Search, external covers, and additional descriptions require an internet connection. Missing metadata is marked unavailable. Search returns up to 24 results per query, with cancellation, timeouts, and a retry state. The app follows your system theme; explicit themes can also be scoped to individual component previews.

Tests use mocked network responses and a DOM test environment. They cover behavior and token references, rather than browser layout or a live Open Library availability check.

Data API: [Open Library search](https://openlibrary.org/dev/docs/api/search).
