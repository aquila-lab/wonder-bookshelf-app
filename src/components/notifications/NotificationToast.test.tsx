import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { initialBooks } from '../../data/initialBooks';
import { createReleaseNotification } from '../../data/initialNotifications';
import { NotificationToast } from './NotificationToast';

test('the arrival stays available while hovered or focused, then dismisses without opening the book', () => {
  vi.useFakeTimers();
  const onDismiss = vi.fn();
  const onActivate = vi.fn();
  render(
    <NotificationToast
      notification={createReleaseNotification('incoming', Date.now())}
      book={initialBooks[0]}
      onDismiss={onDismiss}
      onActivate={onActivate}
    />,
  );
  const toast = screen.getByRole('status');
  fireEvent.mouseEnter(toast);
  act(() => vi.advanceTimersByTime(10_000));
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.focus(screen.getByRole('button', { name: 'View book' }));
  fireEvent.mouseLeave(toast);
  act(() => vi.advanceTimersByTime(10_000));
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.blur(screen.getByRole('button', { name: 'View book' }), {
    relatedTarget: document.body,
  });
  act(() => vi.advanceTimersByTime(8_000));
  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(onActivate).not.toHaveBeenCalled();
});
