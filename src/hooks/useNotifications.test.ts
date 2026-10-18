import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { createReleaseNotification } from '../data/initialNotifications';
import { NOTIFICATION_SNOOZE_MS } from '../lib/notifications';
import { useNotifications } from './useNotifications';

test('read state and original timestamps survive remounting without replaying a toast', () => {
  const hook = renderHook(useNotifications);
  const createdAt = hook.result.current.items[0]?.createdAt;
  act(() => hook.result.current.markRead('sample-release'));
  expect(hook.result.current.unreadCount).toBe(2);
  hook.unmount();
  const next = renderHook(useNotifications);
  expect(next.result.current.unreadCount).toBe(2);
  expect(next.result.current.items[0]?.createdAt).toBe(createdAt);
  expect(next.result.current.arrival).toBeNull();
});

test('a one-week snooze survives reload and mark-all-read leaves the future reminder unread', () => {
  vi.useFakeTimers();
  const now = new Date(2026, 9, 18, 12).getTime();
  vi.setSystemTime(now);
  const hook = renderHook(useNotifications);
  act(() => hook.result.current.snooze('sample-reminder'));
  expect(
    hook.result.current.items.some((item) => item.id === 'sample-reminder'),
  ).toBe(false);
  act(() => hook.result.current.markAllRead());
  hook.unmount();
  const next = renderHook(useNotifications);
  expect(next.result.current.unreadCount).toBe(0);
  vi.setSystemTime(now + NOTIFICATION_SNOOZE_MS);
  act(() => vi.advanceTimersByTime(60_000));
  expect(next.result.current.items[0]?.id).toBe('sample-reminder');
  expect(next.result.current.unreadCount).toBe(1);
});

test('preferences suppress new arrivals, duplicate events are ignored, and dismissing a toast does not mark it read', () => {
  const { result } = renderHook(useNotifications);
  const incoming = createReleaseNotification('incoming', Date.now());
  act(() => result.current.setPreference('release', false));
  act(() => {
    expect(result.current.receive(incoming)).toBe(false);
  });
  expect(result.current.arrival).toBeNull();
  act(() => result.current.setPreference('release', true));
  act(() => {
    expect(result.current.receive(incoming)).toBe(true);
  });
  act(() => {
    expect(result.current.receive(incoming)).toBe(false);
  });
  expect(result.current.unreadCount).toBe(4);
  act(() => result.current.dismissArrival());
  expect(result.current.arrival).toBeNull();
  expect(
    result.current.items.find((item) => item.id === 'incoming')?.read,
  ).toBe(false);
});

test('blocked storage still allows notification actions for the current visit', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('SecurityError');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('SecurityError');
  });
  const { result } = renderHook(useNotifications);
  expect(result.current.storageError).toBe(true);
  act(() => result.current.markAllRead());
  expect(result.current.unreadCount).toBe(0);
});
