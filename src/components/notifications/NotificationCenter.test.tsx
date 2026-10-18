import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { initialBooks } from '../../data/initialBooks';
import { NOTIFICATIONS_STORAGE_KEY } from '../../lib/notifications';
import { NotificationCenter } from './index';

afterEach(() => window.history.replaceState(null, '', '/'));

function setup() {
  const onOpenBook = vi.fn();
  const onBrowse = vi.fn();
  const onRefresh = vi.fn();
  render(
    <>
      <button>Outside</button>
      <NotificationCenter
        books={initialBooks}
        onOpenBook={onOpenBook}
        onBrowse={onBrowse}
        onRefresh={onRefresh}
      />
    </>,
  );
  return { user: userEvent.setup(), onOpenBook, onBrowse, onRefresh };
}

test('opening the panel preserves unread state; mark all read exposes the caught-up state and keeps history', async () => {
  const { user } = setup();
  await user.click(
    screen.getByRole('button', { name: 'Notifications, 3 unread' }),
  );
  const panel = within(screen.getByRole('dialog', { name: 'Notifications' }));
  expect(panel.getAllByRole('article')).toHaveLength(4);
  expect(
    screen.getByRole('button', { name: 'Notifications, 3 unread' }),
  ).toBeTruthy();
  await user.click(panel.getByRole('button', { name: 'Unread 3' }));
  expect(panel.getAllByRole('article')).toHaveLength(3);
  await user.click(panel.getByRole('button', { name: 'Mark all read' }));
  expect(
    panel.getByRole('heading', { name: 'You’re all caught up.' }),
  ).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Notifications' })).toBeTruthy();
  await user.click(panel.getByRole('button', { name: 'All' }));
  expect(panel.getAllByRole('article')).toHaveLength(4);
});

test('book actions open the actual library book and persist read state before navigation', async () => {
  const { user, onOpenBook } = setup();
  await user.click(
    screen.getByRole('button', { name: 'Notifications, 3 unread' }),
  );
  await user.click(screen.getByRole('button', { name: 'View book' }));
  expect(onOpenBook).toHaveBeenCalledWith(
    initialBooks.find((book) => book.id === 'creative-act'),
  );
  expect(screen.queryByRole('dialog')).toBeNull();
  const stored = JSON.parse(
    window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) ?? '{}',
  );
  expect(
    stored.items.find((item: { id: string }) => item.id === 'sample-release')
      .read,
  ).toBe(true);
});

test('Escape returns focus to the bell and an outside click dismisses the panel', async () => {
  const { user } = setup();
  const bell = screen.getByRole('button', { name: 'Notifications, 3 unread' });
  await user.click(bell);
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(bell);
  await user.click(bell);
  await user.click(screen.getByRole('button', { name: 'Outside' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Outside' }),
  );
});

test('preferences are functional, reminders require opt-in, and milestone actions show sample progress', async () => {
  const { user } = setup();
  await user.click(
    screen.getByRole('button', { name: 'Notifications, 3 unread' }),
  );
  await user.click(
    screen.getByRole('button', { name: 'Notification preferences' }),
  );
  const reminder = screen.getByRole('checkbox', {
    name: /Reading reminders/,
  }) as HTMLInputElement;
  expect(reminder.checked).toBe(false);
  await user.click(reminder);
  const stored = JSON.parse(
    window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) ?? '{}',
  );
  expect(stored.preferences.reminder).toBe(true);
  await user.click(
    screen.getByRole('button', { name: 'Back to notifications' }),
  );
  await user.click(screen.getByRole('button', { name: 'View progress' }));
  expect(screen.getByRole('dialog', { name: 'Reading progress' })).toBeTruthy();
  expect(screen.getByText(/Sample reading goal/)).toBeTruthy();
  expect(screen.getByRole('progressbar').getAttribute('value')).toBe('3');
});

test('refresh is deliberate and the sample update action is wired', async () => {
  const { user, onRefresh } = setup();
  expect(onRefresh).not.toHaveBeenCalled();
  await user.click(
    screen.getByRole('button', { name: 'Notifications, 3 unread' }),
  );
  await user.click(screen.getByRole('button', { name: 'Refresh now' }));
  expect(onRefresh).toHaveBeenCalledTimes(1);
});

test('demo arrivals require the flag, cap the badge at 9+, and remain unread when dismissed', async () => {
  window.history.replaceState(null, '', '/?notificationsDemo=1');
  const { user } = setup();
  const outside = screen.getByRole('button', { name: 'Outside' });
  await user.click(outside);
  act(() => {
    for (let i = 0; i < 8; i++)
      window.dispatchEvent(new Event('bookshelf:notify'));
  });
  expect(
    screen.getByRole('button', { name: 'Notifications, 11 unread' }),
  ).toBeTruthy();
  expect(screen.getByText('9+')).toBeTruthy();
  expect(screen.getByText('The Creative Act is here.')).toBeTruthy();
  expect(document.activeElement).toBe(outside);
  await user.click(
    screen.getByRole('button', { name: 'Dismiss notification' }),
  );
  expect(screen.queryByText('The Creative Act is here.')).toBeNull();
  expect(
    screen.getByRole('button', { name: 'Notifications, 11 unread' }),
  ).toBeTruthy();
});

test('normal visits do not accept the demonstration event', () => {
  setup();
  fireEvent(window, new Event('bookshelf:notify'));
  expect(
    screen.getByRole('button', { name: 'Notifications, 3 unread' }),
  ).toBeTruthy();
  expect(
    screen.queryByRole('button', { name: 'Dismiss notification' }),
  ).toBeNull();
});
