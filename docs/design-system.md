# Bookshelf design system

This is the source map for importing the demo into Wonder and for making changes in code. The existing Bookshelf screens are composed from these same components. Import from the public barrels and extend an existing component's typed props or variants when a design needs a change.

## Foundation

Load `src/styles.css` once at the app or preview root. It loads the token source and global foundations, including the bundled Inter Variable font. The component barrels load their component styles:

```tsx
import './src/styles.css';
import { Button, BookCard, SearchField } from './src/components';
import { tokens, type Theme } from './src/design-system';
```

`src/design-system/tokens.css` owns every token value. `tokens.ts` exports references such as `tokens.color.background`, `tokens.space[4]`, `tokens.radius.pill`, and `tokens.font.familySans`; it does not copy the underlying values. Changing a CSS token updates both stylesheet and React-style consumers. Contract tests check that the typed exports match the CSS definitions and that every style variable resolves.

| Family               | Examples                                                                                   | Use                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Semantic colors      | `--color-background`, `--color-foreground`, `--color-primary`, `--color-border`            | Theme-aware roles for surfaces, text, focus, selection, and loading |
| Spacing              | `--space-1`, `--space-2`, `--space-4`, `--space-8`                                         | 4, 8, 16, and 32px; half steps retain the original layout           |
| Typography           | `--font-family-sans`, `--font-size-heading`, `--font-weight-medium`, `--line-height-prose` | Font, size, weight, line height, and tracking                       |
| Shape and focus      | `--radius-md`, `--radius-pill`, `--border-width`, `--focus-offset`                         | Controls, toast, and keyboard focus                                 |
| Component dimensions | `--size-control-md`, `--size-icon-sm`, `--size-cover-card-width`                           | Shared control, icon, and cover geometry                            |
| Layout               | `--layout-sidebar-width`, `--layout-header-height`, `--grid-columns-wide`                  | Screen composition and responsive grids                             |
| Effects              | `--shadow-toast`, `--motion-skeleton-duration`, `--opacity-disabled`                       | Shadows, reduced-motion-aware loading, and disabled states          |

Use semantic colors for new UI. Structural values such as `100%`, `auto`, `0`, and SVG path geometry are not design tokens. Media-query thresholds remain CSS literals because native CSS custom properties cannot be used in media conditions: 380px, 640px, 900px, 1200px, and 1600px. The measured `--app-header-height` and per-icon `--icon-size` are runtime variables; they are not editable foundation tokens.

## Themes

The default follows `prefers-color-scheme`. For a deterministic component preview, set `data-theme="light"` or `data-theme="dark"` on the root or a wrapper. Removing the root attribute restores the system theme. Both modes define the same color roles. Scoped themes also resolve the toast's shadow in the current scope.

```tsx
import { Button } from './src/components';
import { tokens, type Theme } from './src/design-system';

export function ButtonPreview({ theme }: { theme: Theme }) {
  return (
    <div data-theme={theme} style={{ padding: tokens.space[6] }}>
      <Button variant="primary" size="md" startIcon="plus">
        Add book
      </Button>
    </div>
  );
}
```

## Public component inventory

All components are named exports from `src/components/index.ts`, with their prop types. Source files are the definitions to reference when importing into Wonder; adjacent `ui.css`, `books.css`, and `layout.css` files define their appearance.

| Component           | Source                                       | Variants and useful states                                                                                                      |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Button`            | `src/components/ui/Button.tsx`               | `variant`: primary, secondary (default), ghost, link; `size`: sm (default), md, lg; optional start/end icons, disabled, pressed |
| `IconButton`        | `src/components/ui/IconButton.tsx`           | surface (default) or ghost; sm or md (default); required accessible label                                                       |
| `Badge`             | `src/components/ui/Badge.tsx`                | subtle (default) or solid; noninteractive label                                                                                 |
| `Icon`              | `src/components/ui/Icon.tsx`                 | sm, md (default), lg; nine typed icon names                                                                                     |
| `BrandMark`         | `src/components/ui/BrandMark.tsx`            | Original Bookshelf mark                                                                                                         |
| `SearchField`       | `src/components/ui/SearchField.tsx`          | Controlled value, clear, submit, label, placeholder, input ref                                                                  |
| `EmptyState`        | `src/components/ui/EmptyState.tsx`           | Title, description, optional action                                                                                             |
| `Toast`             | `src/components/ui/Toast.tsx`                | Polite live announcement; an empty message hides it                                                                             |
| `BookCover`         | `src/components/books/BookCover.tsx`         | Image, absent image, failed image fallback                                                                                      |
| `BookCard`          | `src/components/books/BookCard.tsx`          | Saved/unsaved; separate open and save actions                                                                                   |
| `BookSkeleton`      | `src/components/books/BookSkeleton.tsx`      | Loading geometry matching a card                                                                                                |
| `BookGrid`          | `src/components/books/BookGrid.tsx`          | Loading, populated, empty; responsive columns                                                                                   |
| `BookListItem`      | `src/components/books/BookListItem.tsx`      | compact (default) sidebar item or summary reading-list item                                                                     |
| `ReadingListButton` | `src/components/books/ReadingListButton.tsx` | Add button or saved state with a native remove menu                                                                             |
| `GenreFilter`       | `src/components/books/GenreFilter.tsx`       | Selected genre; collapsed/expanded list                                                                                         |
| `BookDetails`       | `src/components/books/BookDetails.tsx`       | Description loading/error/missing; saved/unsaved; optional metadata                                                             |
| `AppHeader`         | `src/components/layout/AppHeader.tsx`        | Browse/saved view, controlled search, add action                                                                                |
| `LibrarySidebar`    | `src/components/layout/LibrarySidebar.tsx`   | Browse/saved selection, counts, up-next items                                                                                   |

The screen composition is `src/features/library/CollectionView.tsx`; `src/App.tsx` connects it to application state. Presentational components do not read localStorage or fetch data. Use `Book` from `src/types/book.ts` and pass callbacks to connect interactions. The hooks own persistence, request cancellation, debounce, caching, and timeouts.

## Data and icons for importing

Use `src/data/initialBooks.ts` for reproducible, offline examples. `creative-act` has a subtitle, edition, description, publisher, date, page count, ISBN, and multiple categories, making it a useful detail-screen fixture. `atomic-habits` starts unsaved; `creative-act` and `midnight-library` start saved. For a missing-cover state, pass a copy of a book with `cover: undefined`. Loading and error states can be supplied through component props without calling the API.

Use the original SVG geometry in `iconPaths` from `src/components/ui/Icon.tsx`: plus, check, search, arrow, back, down, close, bookmark, and grid. The mark is in `BrandMark.tsx`. Icon sizes and stroke width reference the shared tokens.

## Working in Wonder

1. Connect this repository to the Wonder design file, or use the checkout with a worktree agent.
2. Import the foundation from `tokens.css` before the components. Use the actual values for the selected theme and preserve the semantic names. Color, dimension, plain-number, font-family, and font-weight tokens map to Wonder variables. Compound CSS expressions such as shadows, aspect ratios, font features, and easing remain code styles; bind their supported constituents where needed.
3. Import the needed component definitions from the inventory, using their styles, seed data, and repository icons. Associate the resulting design elements with the actual component source using Wonder's repository references (`data-github-reference`). The component's props define its variants; the inventory is documentation, not a proprietary import manifest.
4. Compose screens from those imported components. When bringing a change back to code, update a token or extend a component's props/variants so the application and imported library continue to share one implementation.

No Wonder file or canvas library is created by installing this app. The source is prepared for a separate import into the file you choose.
