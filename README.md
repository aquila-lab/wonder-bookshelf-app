# Bookshelf

> **Purpose:** This repository exists only for onboarding to Wonder. It is a sample app for getting familiar with the Wonder workflow, not a production project.

A small React + Vite app based on the two Wonder bookshelf designs. No account, API key, or backend needed.

Install dependencies with `npm install`. The `dev` script runs Vite on port 5173; `npm run build` produces a static site in `dist`, and `npm test` checks reading-list storage and search data handling. In Wonder, open the app Preview to run the dev server.

- Browse the six starting books and filter by genre.
- Search titles or authors through Open Library, or search just your saved books from My reading list.
- Open a cover for book details. Use + to save; use the saved button to remove.
- Add book focuses the search field. Saving a search result adds it to your collection.
- Your collection and reading list are stored in this browser's localStorage. They do not sync between devices. When storage is blocked, changes last only for the current visit.

The original book covers and Inter Variable font are bundled locally. Search, external covers, and additional book descriptions require an internet connection. Metadata that Open Library does not supply is marked unavailable. Search returns up to 24 results per query.

Design adjustments for working data: the duplicate Midnight Library entry is removed, filler descriptions use book summaries, and saved books show a checkmark. Narrow screens reflow the grid and detail layout.

Data API: https://openlibrary.org/dev/docs/api/search
