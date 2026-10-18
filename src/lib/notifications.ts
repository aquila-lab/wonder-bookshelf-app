import { createInitialNotifications } from '../data/initialNotifications';
import type {
  BookNotification,
  NotificationKind,
  NotificationPreferences,
  NotificationState,
} from '../types/notification';
import { isRecord } from './guards';

export const NOTIFICATIONS_STORAGE_KEY = 'bookshelf-notifications-v1';
export const NOTIFICATION_SNOOZE_MS = 7 * 24 * 60 * 60_000;
export const MAX_NOTIFICATIONS = 100;
export const notificationKinds: NotificationKind[] = [
  'release',
  'reminder',
  'milestone',
  'system',
];

export const defaultNotificationPreferences: NotificationPreferences = {
  release: true,
  reminder: false,
  milestone: true,
  system: true,
};

function isTimestamp(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    value >= 0 &&
    Number.isFinite(new Date(value).getTime())
  );
}

function parseNotification(value: unknown): BookNotification | null {
  if (
    !isRecord(value) ||
    !['id', 'category', 'title', 'message'].every(
      (key) => typeof value[key] === 'string' && value[key].length <= 2_000,
    ) ||
    !value.id ||
    !isTimestamp(value.createdAt) ||
    typeof value.read !== 'boolean' ||
    typeof value.isDemo !== 'boolean' ||
    (value.snoozedUntil !== undefined && !isTimestamp(value.snoozedUntil))
  ) {
    return null;
  }

  const base = {
    id: value.id as string,
    category: value.category as string,
    title: value.title as string,
    message: value.message as string,
    createdAt: value.createdAt,
    read: value.read,
    isDemo: value.isDemo,
    ...(isTimestamp(value.snoozedUntil)
      ? { snoozedUntil: value.snoozedUntil }
      : {}),
  };
  if (value.kind === 'system') return { ...base, kind: 'system' };
  if (typeof value.bookId !== 'string' || !value.bookId) return null;
  if (value.kind === 'release' || value.kind === 'reminder') {
    return { ...base, kind: value.kind, bookId: value.bookId };
  }
  const progress = value.progress;
  if (
    value.kind === 'milestone' &&
    isRecord(progress) &&
    typeof progress.completed === 'number' &&
    Number.isInteger(progress.completed) &&
    progress.completed >= 0 &&
    typeof progress.goal === 'number' &&
    Number.isInteger(progress.goal) &&
    progress.goal > 0 &&
    progress.completed <= progress.goal &&
    typeof progress.year === 'number' &&
    Number.isInteger(progress.year) &&
    progress.year >= 1900 &&
    progress.year <= 9999
  ) {
    return {
      ...base,
      kind: 'milestone',
      bookId: value.bookId,
      progress: {
        completed: progress.completed,
        goal: progress.goal,
        year: progress.year,
      },
    };
  }
  return null;
}

export function readNotifications(
  storage: Pick<Storage, 'getItem'>,
  now = Date.now(),
): { state: NotificationState; storageError: boolean } {
  const fallback: NotificationState = {
    version: 1,
    items: createInitialNotifications(now),
    preferences: { ...defaultNotificationPreferences },
  };
  try {
    const raw = storage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return { state: fallback, storageError: false };
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.items) ||
      !isRecord(parsed.preferences)
    ) {
      throw new Error('Invalid notifications');
    }
    const items = parsed.items
      .slice(0, MAX_NOTIFICATIONS)
      .map(parseNotification);
    if (items.some((item) => item === null)) {
      throw new Error('Invalid notification');
    }
    const preferences = { ...defaultNotificationPreferences };
    for (const kind of notificationKinds) {
      if (typeof parsed.preferences[kind] === 'boolean') {
        preferences[kind] = parsed.preferences[kind];
      }
    }
    const unique = new Map(
      items.filter((item) => item !== null).map((item) => [item.id, item]),
    );
    return {
      state: { version: 1, items: [...unique.values()], preferences },
      storageError: false,
    };
  } catch {
    return { state: fallback, storageError: true };
  }
}

export function notificationDate(notification: BookNotification): number {
  return Math.max(notification.createdAt, notification.snoozedUntil ?? 0);
}

export function visibleNotifications(items: BookNotification[], now: number) {
  return items
    .filter((item) => !item.snoozedUntil || item.snoozedUntil <= now)
    .sort((a, b) => notificationDate(b) - notificationDate(a));
}

export function notificationDay(timestamp: number, now: number) {
  return new Date(timestamp).toDateString() === new Date(now).toDateString()
    ? 'Today'
    : 'Earlier';
}

export function formatNotificationTime(timestamp: number, now: number): string {
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < 60_000) return 'Just now';
  if (notificationDay(timestamp, now) === 'Today') {
    return elapsed < 60 * 60_000
      ? `${Math.floor(elapsed / 60_000)}m ago`
      : `${Math.floor(elapsed / (60 * 60_000))}h ago`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (new Date(timestamp).toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    ...(new Date(timestamp).getFullYear() !== new Date(now).getFullYear()
      ? { year: 'numeric' as const }
      : {}),
  }).format(timestamp);
}
