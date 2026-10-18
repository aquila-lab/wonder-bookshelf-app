export const initialBooks = [
  { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', genre: 'Nonfiction', categories: ['Nonfiction', 'Habits'], cover: '/covers/atomic-habits.jpg', description: 'A practical guide to building good habits, breaking bad ones, and making small changes that last.' },
  { id: 'crying-in-h-mart', title: 'Crying in H Mart', author: 'Michelle Zauner', genre: 'Memoir', categories: ['Memoir'], cover: '/covers/crying-in-h-mart.jpg', description: 'Michelle Zauner reflects on family, food, grief, and her Korean American identity.' },
  { id: 'art-of-noticing', title: 'The Art of Noticing', author: 'Rob Walker', genre: 'Nonfiction', categories: ['Nonfiction', 'Creativity'], cover: '/covers/art-of-noticing.jpg', description: 'An invitation to pay attention, spark curiosity, and rediscover the world around you through small creative exercises.' },
  { id: 'creative-act', title: 'The Creative Act', subtitle: 'A Way of Being', author: 'Rick Rubin', genre: 'Nonfiction', categories: ['Nonfiction', 'Creativity', 'Philosophy'], cover: '/covers/creative-act.jpg', edition: 'Hardcover edition', publisher: 'Penguin Press', published: 'January 17, 2023', pages: 432, isbn: '9780593652886', description: 'Rick Rubin explores creativity as a way of paying attention to the world. Drawing on his work with artists, he reflects on curiosity, experimentation, and making space for ideas.\n\nAn invitation to develop your own creative practice, whether you make music, write, design, or simply want to see everyday life differently.' },
  { id: 'midnight-library', title: 'The Midnight Library', author: 'Matt Haig', genre: 'Fiction', categories: ['Fiction'], cover: '/covers/midnight-library.jpg', description: 'Between life and death, a library offers Nora Seed the chance to explore the lives she could have lived.' },
  { id: 'tomorrow', title: 'Tomorrow, and Tomorrow, and Tomorrow', displayTitle: 'Tomorrow, and', author: 'Gabrielle Zevin', genre: 'Fiction', categories: ['Fiction'], cover: '/covers/tomorrow.jpg', description: 'Two childhood friends reunite to make video games in a story of creativity, ambition, and a complicated lifelong friendship.' },
];
export const STORAGE_KEY = 'bookshelf-library-v1';
export function readLibrary(storage) {
  const fallback = { books: initialBooks, saved: ['creative-act', 'midnight-library'], storageError: false };
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.books) || !Array.isArray(parsed.saved)) throw new Error('Invalid library');
    const valid = parsed.books.filter(b => b && typeof b.id === 'string' && typeof b.title === 'string' && typeof b.author === 'string');
    const books = [...initialBooks, ...valid.filter(b => !initialBooks.some(seed => seed.id === b.id))];
    return { books, saved: [...new Set(parsed.saved)].filter(id => books.some(b => b.id === id)), storageError: false };
  } catch { return { ...fallback, storageError: true }; }
}
export function toggleSaved(library, book) {
  return {
    ...library,
    books: library.books.some(b => b.id === book.id) ? library.books : [...library.books, book],
    saved: library.saved.includes(book.id) ? library.saved.filter(id => id !== book.id) : [...library.saved, book.id],
  };
}
export function matchesBook(book, query) {
  return `${book.title} ${book.author}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}
export function normalizeBook(doc) {
  const subjects = (doc.subject || []).map(s => s.toLowerCase());
  const genre = subjects.some(s => /memoir|autobiograph/.test(s)) ? 'Memoir' : subjects.some(s => s === 'fiction' || s.includes('fiction,')) ? 'Fiction' : subjects.some(s => /nonfiction|non-fiction/.test(s)) ? 'Nonfiction' : 'Book';
  return { id: doc.key, title: doc.title, author: doc.author_name?.join(', ') || 'Unknown author', cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '', genre, categories: [genre], published: doc.first_publish_year ? String(doc.first_publish_year) : undefined };
}
export async function searchBooks(query, signal) {
  const params = new URLSearchParams({ q: query, limit: '24', fields: 'key,title,author_name,cover_i,first_publish_year,subject' });
  const response = await fetch(`https://openlibrary.org/search.json?${params}`, { signal });
  if (!response.ok) throw new Error('Search unavailable');
  const data = await response.json();
  return (data.docs || []).filter(doc => doc.key && doc.title).map(normalizeBook);
}
