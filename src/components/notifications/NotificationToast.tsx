import { useEffect, useState } from 'react';
import type { Book } from '../../types/book';
import type { BookNotification } from '../../types/notification';
import { BookCover } from '../books';
import { BrandMark, Button, IconButton, Toast } from '../ui';
import { notificationActions } from './NotificationItem';

export interface NotificationToastProps {
  notification: BookNotification;
  book?: Book;
  onActivate: (notification: BookNotification) => void;
  onDismiss: () => void;
}

export function NotificationToast({
  notification,
  book,
  onActivate,
  onDismiss,
}: NotificationToastProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (hovered || focused) return;
    const timeout = window.setTimeout(onDismiss, 8_000);
    return () => window.clearTimeout(timeout);
  }, [notification.id, hovered, focused, onDismiss]);

  return (
    <Toast
      variant="notification"
      className="notification-arrival"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {book ? (
        <BookCover book={book} />
      ) : (
        <div className="notification-system-mark">
          <BrandMark />
        </div>
      )}
      <div className="notification-arrival-content">
        <p className="notification-arrival-category">
          <span className="notification-unread" aria-hidden="true" />
          {notification.category}
        </p>
        <p className="notification-arrival-title">
          {notification.title}
          {notification.kind === 'release' ? ' is here.' : ''}
        </p>
        <Button
          variant="link"
          endIcon="arrow"
          onClick={() => onActivate(notification)}
        >
          {notificationActions[notification.kind]}
        </Button>
      </div>
      <IconButton
        icon="close"
        variant="ghost"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      />
    </Toast>
  );
}
