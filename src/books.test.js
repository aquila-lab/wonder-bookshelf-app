import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialBooks, readLibrary, toggleSaved, normalizeBook, matchesBook, searchBooks } from './books.js';

test('saved search results persist, without duplicate books or IDs', () => {
  const book = { id: '/works/OL123W', title: 'A new book', author: 'An author' };
  const empty = readLibrary({ getItem: () => null });
  const added = toggleSaved(empty, book);
  const restored = readLibrary({ getItem: () => JSON.stringify(added) });
  assert.ok(restored.saved.includes(book.id));
  assert.equal(restored.books.find(b => b.id === book.id).title, book.title);
  const removed = toggleSaved(restored, book);
  assert.ok(!removed.saved.includes(book.id));
  assert.equal(toggleSaved(removed, book).books.filter(b => b.id === book.id).length, 1);
});
test('empty reading lists stay empty on reload', () => {
  assert.deepEqual(readLibrary({ getItem: () => JSON.stringify({ books: initialBooks, saved: [] }) }).saved, []);
});
test('invalid or blocked storage falls back safely', () => {
  for (const getItem of [() => '{broken', () => { throw new Error('SecurityError'); }, () => JSON.stringify({ books: [], saved: 'invalid' })]) {
    const state = readLibrary({ getItem });
    assert.equal(state.books.length, 6);
    assert.equal(state.storageError, true);
  }
});
test('invalid books and dangling saved IDs are discarded', () => {
  const state = readLibrary({ getItem: () => JSON.stringify({ books: [null, {}, { id: 123 }], saved: ['unknown', 'creative-act', 'creative-act'] }) });
  assert.deepEqual(state.saved, ['creative-act']);
});
test('search handles title and author casing, missing metadata, and memoirs', () => {
  assert.ok(matchesBook(initialBooks[0], '  JAMES CLEAR '));
  assert.ok(matchesBook(initialBooks[0], 'ATOMIC'));
  assert.equal(normalizeBook({ key: '/works/1', title: 'Book' }).author, 'Unknown author');
  assert.equal(normalizeBook({ key: '/works/2', title: 'Book', subject: ['Autobiography'] }).genre, 'Memoir');
});
test('search encodes the query, limits results and skips unusable records', async t => {
  let requested;
  t.mock.method(globalThis, 'fetch', async url => {
    requested = new URL(url);
    return { ok: true, json: async () => ({ docs: [{ key: '/works/1', title: 'One' }, { title: 'No ID' }] }) };
  });
  const results = await searchBooks('food & culture');
  assert.equal(requested.searchParams.get('q'), 'food & culture');
  assert.equal(requested.searchParams.get('limit'), '24');
  assert.equal(results.length, 1);
});
test('search surfaces upstream failures', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false }));
  await assert.rejects(searchBooks('test'), /Search unavailable/);
});
