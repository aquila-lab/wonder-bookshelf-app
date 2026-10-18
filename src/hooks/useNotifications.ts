import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MAX_NOTIFICATIONS,
  NOTIFICATIONS_STORAGE_KEY,
  NOTIFICATION_SNOOZE_MS,
  readNotifications,
  visibleNotifications,
} from '../lib/notifications';
import type {
  BookNotification,
  NotificationKind,
  NotificationState,
} from '../types/notification';

export function useNotifications() {
  const [initial] = useState(() =>
    readNotifications({ getItem: (key) => window.localStorage.getItem(key) }),
  );
  const [state, setState] = useState(initial.state);
  const current = useRef(state);
  const [storageError, setStorageError] = useState(initial.storageError);
  const [now, setNow] = useState(Date.now);
  const [arrival, setArrival] = useState<BookNotification | null>(null);

  const persist = useCallback((next: NotificationState) => {
    try {
      window.localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(next),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  // Commit before navigating or refreshing; a React effect could run too late.
  const update = useCallback(
    (change: (value: NotificationState) => NotificationState) => {
      const next = change(current.current);
      current.current = next;
      setState(next);
      persist(next);
    },
    [persist],
  );

  useEffect(() => {
    persist(current.current);
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [persist]);

  const receive = useCallback(
    (notification: BookNotification) => {
      if (
        !current.current.preferences[notification.kind] ||
        current.current.items.some((item) => item.id === notification.id)
      ) {
        return false;
      }
      update((value) => ({
        ...value,
        items: [{ ...notification, read: false }, ...value.items].slice(
          0,
          MAX_NOTIFICATIONS,
        ),
      }));
      setNow(Date.now());
      setArrival(notification);
      return true;
    },
    [update],
  );

  const markRead = useCallback(
    (id: string) => {
      update((value) => ({
        ...value,
        items: value.items.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      }));
      setArrival((item) => (item?.id === id ? null : item));
    },
    [update],
  );

  const markAllRead = () => {
    const time = Date.now();
    update((value) => ({
      ...value,
      items: value.items.map((item) =>
        !item.snoozedUntil || item.snoozedUntil <= time
          ? { ...item, read: true }
          : item,
      ),
    }));
    setArrival(null);
  };

  const snooze = (id: string) => {
    const time = Date.now();
    update((value) => ({
      ...value,
      items: value.items.map((item) =>
        item.id === id && item.kind === 'reminder'
          ? {
              ...item,
              read: false,
              snoozedUntil: time + NOTIFICATION_SNOOZE_MS,
            }
          : item,
      ),
    }));
    setNow(time);
    setArrival((item) => (item?.id === id ? null : item));
  };

  const setPreference = (kind: NotificationKind, enabled: boolean) => {
    update((value) => ({
      ...value,
      preferences: { ...value.preferences, [kind]: enabled },
    }));
    if (!enabled) setArrival((item) => (item?.kind === kind ? null : item));
  };

  const dismissArrival = useCallback(() => setArrival(null), []);
  const items = visibleNotifications(state.items, now);
  return {
    items,
    now,
    unreadCount: items.filter((item) => !item.read).length,
    preferences: state.preferences,
    storageError,
    arrival,
    receive,
    markRead,
    markAllRead,
    snooze,
    setPreference,
    dismissArrival,
  };
}
