import {
  formatNotificationTime,
  notificationDate,
} from '../../lib/notifications';
import type { Book } from '../../types/book';
import type {
  BookNotification,
  NotificationKind,
} from '../../types/notification';
import { BookCover } from '../books';
import { BrandMark, Button } from '../ui';

export const notificationActions: Record<NotificationKind, string> = {
  release: 'View book',
  reminder: 'Open book',
  milestone: 'View progress',
  system: 'Refresh now',
};

export interface NotificationItemProps {
  notification: BookNotification;
  book?: Book;
  now: number;
  onActivate: (notification: BookNotification) => void;
  onSnooze: (id: string) => void;
}

export function NotificationItem({
  notification,
  book,
  now,
  onActivate,
  onSnooze,
}: NotificationItemProps) {
  const date = notificationDate(notification);
  return (
    <article
      className="notification-item"
      aria-label={`${notification.title}${notification.read ? '' : ', unread'}`}
    >
      {book ? (
        <BookCover book={book} />
      ) : (
        <div className="notification-system-mark">
          <BrandMark />
        </div>
      )}
      <div className="notification-item-content">
        <div className="notification-item-meta">
          <span>{notification.category}</span>
          <time
            dateTime={new Date(date).toISOString()}
            title={new Date(date).toLocaleString()}
          >
            {formatNotificationTime(date, now)}
          </time>
        </div>
        <div className="notification-item-title">
          <Button variant="ghost" onClick={() => onActivate(notification)}>
            {notification.title}
          </Button>
          {!notification.read && (
            <span className="notification-unread" aria-hidden="true" />
          )}
        </div>
        <p className="notification-item-message">{notification.message}</p>
        <div className="notification-item-actions">
          <Button
            className="notification-action"
            variant="link"
            endIcon={
              notification.kind === 'release' ||
              notification.kind === 'reminder'
                ? 'arrow'
                : undefined
            }
            onClick={() => onActivate(notification)}
          >
            {notificationActions[notification.kind]}
          </Button>
          {notification.kind === 'reminder' && (
            <Button variant="link" onClick={() => onSnooze(notification.id)}>
              Remind me later
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
