import { expect, test } from 'vitest';
import { createInitialNotifications } from '../data/initialNotifications';
import {
  defaultNotificationPreferences,
  formatNotificationTime,
  notificationDay,
  readNotifications,
  visibleNotifications,
} from './notifications';

const now = new Date(2026, 9, 18, 12).getTime();

test('new installations seed three unread examples and require opting in to future reminders', () => {
  const { state, storageError } = readNotifications(
    { getItem: () => null },
    now,
  );
  expect(state.items.filter((item) => !item.read)).toHaveLength(3);
  expect(state.preferences.reminder).toBe(false);
  expect(storageError).toBe(false);
});

test('malformed notification data recovers safely and a deliberately empty history stays empty', () => {
  for (const raw of [
    '{broken',
    '{"version":2}',
    JSON.stringify({
      version: 1,
      items: [
        { ...createInitialNotifications(now)[0], createdAt: 'yesterday' },
      ],
      preferences: {},
    }),
  ]) {
    expect(
      readNotifications({ getItem: () => raw }, now).state.items,
    ).toHaveLength(4);
  }
  const empty = JSON.stringify({
    version: 1,
    items: [],
    preferences: defaultNotificationPreferences,
  });
  expect(readNotifications({ getItem: () => empty }, now).state.items).toEqual(
    [],
  );
});

test('snoozed items are hidden until due and return at the top without mutating history', () => {
  const items = createInitialNotifications(now);
  const reminder = items.find((item) => item.kind === 'reminder');
  if (!reminder) throw new Error('Missing fixture');
  reminder.snoozedUntil = now + 1_000;
  expect(visibleNotifications(items, now)).toHaveLength(3);
  expect(visibleNotifications(items, now + 1_000)[0]?.id).toBe(reminder.id);
  expect(items[0]?.id).toBe('sample-release');
});

test('day groups and timestamps follow local calendar boundaries, including midnight', () => {
  const justAfterMidnight = new Date(2026, 9, 18, 0, 5).getTime();
  const lastNight = new Date(2026, 9, 17, 23, 55).getTime();
  expect(notificationDay(lastNight, justAfterMidnight)).toBe('Earlier');
  expect(formatNotificationTime(lastNight, justAfterMidnight)).toBe(
    'Yesterday',
  );
  expect(formatNotificationTime(now - 12 * 60_000, now)).toBe('12m ago');
  expect(formatNotificationTime(now, now)).toBe('Just now');
});
