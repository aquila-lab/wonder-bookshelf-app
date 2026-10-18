import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { App } from './App';
import { STORAGE_KEY } from './lib/library';

test('browse, genre filtering, saving, details, and removal work through the extracted components', async () => {
  const user = userEvent.setup();
  const app = render(<App />);
  const books = () => within(screen.getByRole('region', { name: 'Books' }));
  expect(books().getAllByRole('article')).toHaveLength(6);

  await user.click(screen.getByRole('button', { name: 'Fiction' }));
  expect(books().getAllByRole('article')).toHaveLength(2);
  await user.click(screen.getByRole('button', { name: 'All books' }));
  await user.click(
    screen.getByRole('button', { name: 'Add Atomic Habits to reading list' }),
  );
  expect(
    screen
      .getByRole('button', { name: 'Remove Atomic Habits from reading list' })
      .getAttribute('aria-pressed'),
  ).toBe('true');

  app.unmount();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'My reading list' }));
  expect(books().getAllByRole('article')).toHaveLength(3);
  await user.click(screen.getByRole('button', { name: 'View Atomic Habits' }));
  expect(
    screen.getByRole('heading', { name: 'Atomic Habits', level: 1 }),
  ).toBeTruthy();
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Reading list status' }),
    'remove',
  );
  expect(
    screen.getByRole('button', { name: 'Add to reading list' }),
  ).toBeTruthy();
  await user.click(
    within(screen.getByRole('main')).getByRole('button', {
      name: 'My reading list',
    }),
  );
  expect(books().getAllByRole('article')).toHaveLength(2);
});

test('an empty reading list persists and can return to browsing', async () => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ books: [], saved: [] }),
  );
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'My reading list' }));
  expect(
    screen.getByRole('heading', { name: 'Your next chapter starts here.' }),
  ).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Browse books' }));
  expect(
    screen.getByRole('heading', { name: 'Find your next chapter.' }),
  ).toBeTruthy();
});

test('searches Open Library, saves a result, and searches the reading list locally', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json({
      docs: [
        {
          key: '/works/demo',
          title: 'Wonder Book',
          author_name: ['Demo Author'],
        },
      ],
    }),
  );
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Add book' }));
  expect(document.activeElement).toBe(
    screen.getByRole('textbox', { name: 'Search books or authors' }),
  );
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'wonder' },
  });
  expect(screen.getByText('Searching Open Library…')).toBeTruthy();
  await user.click(
    await screen.findByRole('button', {
      name: 'Add Wonder Book to reading list',
    }),
  );
  expect(fetch).toHaveBeenCalledTimes(1);

  await user.click(screen.getByRole('button', { name: 'My reading list' }));
  await user.type(screen.getByRole('textbox'), 'Demo Author');
  expect(screen.getByRole('button', { name: 'View Wonder Book' })).toBeTruthy();
  expect(
    within(screen.getByRole('region', { name: 'Search results' })).getAllByRole(
      'article',
    ),
  ).toHaveLength(1);
  expect(fetch).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole('button', { name: 'Clear search' }));
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
  expect(document.activeElement).toBe(screen.getByRole('textbox'));
});

test('search failures show an actionable retry that recovers', async () => {
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValue(
      Response.json({
        docs: [{ key: '/works/retry', title: 'Recovered Book' }],
      }),
    );
  const user = userEvent.setup();
  render(<App />);
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'recovered' },
  });
  await user.click(await screen.findByRole('button', { name: 'Try again' }));
  expect(
    await screen.findByRole('button', { name: 'View Recovered Book' }),
  ).toBeTruthy();
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('blocked browser storage leaves the reading list usable for this visit', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('SecurityError');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('SecurityError');
  });
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText(/Browser storage is unavailable/)).toBeTruthy();
  await user.click(
    screen.getByRole('button', { name: 'Add Atomic Habits to reading list' }),
  );
  expect(
    screen.getByRole('button', {
      name: 'Remove Atomic Habits from reading list',
    }),
  ).toBeTruthy();
});

test('the header notification opens its book in the existing detail view', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(
    screen.getByRole('button', { name: 'Notifications, 3 unread' }),
  );
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'View book',
    }),
  );
  expect(
    screen.getByRole('heading', { name: 'The Creative Act', level: 1 }),
  ).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();
});
