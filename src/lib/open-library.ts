import type { Book } from '../types/book';
import { isRecord, stringArray } from './guards';

export interface OpenLibraryDocument {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
}

export function normalizeBook(doc: OpenLibraryDocument): Book {
  const subjects = (doc.subject ?? []).map((subject) => subject.toLowerCase());
  const genre = subjects.some((subject) => /memoir|autobiograph/.test(subject))
    ? 'Memoir'
    : subjects.some(
          (subject) => subject === 'fiction' || subject.includes('fiction,'),
        )
      ? 'Fiction'
      : subjects.some((subject) => /nonfiction|non-fiction/.test(subject))
        ? 'Nonfiction'
        : 'Book';

  return {
    id: doc.key,
    title: doc.title,
    author: doc.author_name?.join(', ') || 'Unknown author',
    cover: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : '',
    genre,
    categories: [genre],
    published: doc.first_publish_year
      ? String(doc.first_publish_year)
      : undefined,
  };
}

function parseDocument(value: unknown): OpenLibraryDocument | null {
  if (
    !isRecord(value) ||
    typeof value.key !== 'string' ||
    !value.key ||
    typeof value.title !== 'string' ||
    !value.title
  )
    return null;
  return {
    key: value.key,
    title: value.title,
    author_name: stringArray(value.author_name),
    subject: stringArray(value.subject),
    cover_i: typeof value.cover_i === 'number' ? value.cover_i : undefined,
    first_publish_year:
      typeof value.first_publish_year === 'number'
        ? value.first_publish_year
        : undefined,
  };
}

export async function searchBooks(
  query: string,
  signal?: AbortSignal,
): Promise<Book[]> {
  const params = new URLSearchParams({
    q: query,
    limit: '24',
    fields: 'key,title,author_name,cover_i,first_publish_year,subject',
  });
  const response = await fetch(
    `https://openlibrary.org/search.json?${params}`,
    { signal },
  );
  if (!response.ok) throw new Error('Search unavailable');
  const data: unknown = await response.json();
  if (!isRecord(data) || !Array.isArray(data.docs)) return [];
  return data.docs
    .map(parseDocument)
    .filter((doc): doc is OpenLibraryDocument => doc !== null)
    .map(normalizeBook);
}

export async function fetchBookDescription(
  id: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  const response = await fetch(`https://openlibrary.org${id}.json`, { signal });
  if (!response.ok) throw new Error('Description unavailable');
  const data: unknown = await response.json();
  if (!isRecord(data)) return undefined;
  if (typeof data.description === 'string') return data.description;
  return isRecord(data.description) &&
    typeof data.description.value === 'string'
    ? data.description.value
    : undefined;
}
