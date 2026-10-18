import { useEffect, useRef, useState } from 'react';
import type { useNotifications } from '../../hooks/useNotifications';
import { notificationDate, notificationDay } from '../../lib/notifications';
import type { Book } from '../../types/book';
import type {
  BookNotification,
  NotificationKind,
} from '../../types/notification';
import { Button, EmptyState, IconButton } from '../ui';
import { NotificationItem } from './NotificationItem';

const preferenceOptions: {
  kind: NotificationKind;
  label: string;
  description: string;
}[] = [
  {
    kind: 'release',
    label: 'New from authors',
    description: 'New titles from authors you follow.',
  },
  {
    kind: 'reminder',
    label: 'Reading reminders',
    description: 'A gentle nudge, at most once a week.',
  },
  {
    kind: 'milestone',
    label: 'Reading milestones',
    description: 'Celebrate progress toward your goal.',
  },
  {
    kind: 'system',
    label: 'Bookshelf updates',
    description: 'Know when a fresh version is ready.',
  },
];

export interface NotificationPanelProps {
  id: string;
  books: Book[];
  notifications: ReturnType<typeof useNotifications>;
  detail: Extract<BookNotification, { kind: 'milestone' }> | null;
  onBack: () => void;
  onClose: () => void;
  onBrowse: () => void;
  onActivate: (notification: BookNotification) => void;
  onDemo?: () => void;
}

export function NotificationPanel({
  id,
  books,
  notifications,
  detail,
  onBack,
  onClose,
  onBrowse,
  onActivate,
  onDemo,
}: NotificationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { items, now, unreadCount, preferences, storageError } = notifications;
  const filtered =
    filter === 'all' ? items : items.filter((item) => !item.read);
  const title = preferencesOpen
    ? 'Notification preferences'
    : detail
      ? 'Reading progress'
      : 'Notifications';

  useEffect(() => {
    headingRef.current?.focus();
  }, [preferencesOpen, detail?.id]);

  return (
    <section
      id={id}
      className="notification-panel"
      role="dialog"
      aria-labelledby={`${id}-title`}
    >
      <div className="notification-panel-header">
        <div className="notification-panel-title">
          <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}>
            {title}
          </h2>
          <IconButton
            icon="close"
            variant="ghost"
            aria-label="Close notifications"
            onClick={onClose}
          />
        </div>
        {!preferencesOpen && !detail ? (
          <>
            <p className="notification-intro">
              A little news for your reading life.
            </p>
            <div className="notification-toolbar">
              <div
                className="notification-filters"
                role="group"
                aria-label="Filter notifications"
              >
                <Button
                  variant={filter === 'all' ? 'primary' : 'secondary'}
                  aria-pressed={filter === 'all'}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'unread' ? 'primary' : 'secondary'}
                  aria-pressed={filter === 'unread'}
                  onClick={() => setFilter('unread')}
                >
                  Unread {unreadCount}
                </Button>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="link"
                  onClick={() => {
                    notifications.markAllRead();
                    headingRef.current?.focus();
                  }}
                >
                  Mark all read
                </Button>
              )}
            </div>
          </>
        ) : (
          <Button
            variant="link"
            startIcon="back"
            onClick={() => {
              setPreferencesOpen(false);
              onBack();
            }}
          >
            Back to notifications
          </Button>
        )}
      </div>

      {storageError && (
        <p className="notification-storage-warning" role="status">
          Notification changes will last for this visit only. Browser storage is
          unavailable.
        </p>
      )}

      <div className="notification-panel-body">
        {preferencesOpen ? (
          <div className="notification-preferences">
            <p>
              Choose which new notifications appear. Existing activity stays in
              your history.
            </p>
            {preferenceOptions.map(({ kind, label, description }) => (
              <label className="notification-preference" key={kind}>
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <input
                  type="checkbox"
                  checked={preferences[kind]}
                  onChange={(event) =>
                    notifications.setPreference(kind, event.target.checked)
                  }
                />
              </label>
            ))}
            <p className="notification-demo-note">
              This Bookshelf demo includes sample releases, reminders, reading
              goals, and updates. Live activity is not connected.
            </p>
            {onDemo && (
              <Button
                variant="secondary"
                disabled={!preferences.release}
                onClick={onDemo}
              >
                Send sample notification
              </Button>
            )}
          </div>
        ) : detail ? (
          <div className="notification-progress">
            <p className="notification-intro">
              {detail.isDemo ? 'Sample reading goal' : 'Your reading goal'} ·{' '}
              {detail.progress.year}
            </p>
            <p className="notification-progress-total">
              {detail.progress.completed}{' '}
              <span>of {detail.progress.goal} books</span>
            </p>
            <progress
              aria-label="Books finished toward reading goal"
              value={detail.progress.completed}
              max={detail.progress.goal}
            />
            <p>{detail.message}</p>
            {detail.isDemo && (
              <p className="notification-demo-note">
                An example milestone to explore. Your reading progress is not
                being tracked yet.
              </p>
            )}
            <Button variant="primary" onClick={onBrowse}>
              Find your next book
            </Button>
          </div>
        ) : filtered.length ? (
          <>
            {(['Today', 'Earlier'] as const).map((group) => {
              const grouped = filtered.filter(
                (item) =>
                  notificationDay(notificationDate(item), now) === group,
              );
              return grouped.length ? (
                <section
                  className="notification-group"
                  aria-label={group}
                  key={group}
                >
                  <h3>{group}</h3>
                  <ul>
                    {grouped.map((notification) => (
                      <li key={notification.id}>
                        <NotificationItem
                          notification={notification}
                          book={
                            'bookId' in notification
                              ? books.find(
                                  (book) => book.id === notification.bookId,
                                )
                              : undefined
                          }
                          now={now}
                          onActivate={onActivate}
                          onSnooze={(notificationId) => {
                            notifications.snooze(notificationId);
                            setNotice('Reminder snoozed for one week.');
                            headingRef.current?.focus();
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null;
            })}
          </>
        ) : (
          <div className="notification-empty">
            <EmptyState
              icon="bookmark"
              title="You’re all caught up."
              description="Nothing new on your shelf. Time to get lost in a good book."
              action={
                <Button variant="primary" size="md" onClick={onBrowse}>
                  Browse books
                </Button>
              }
            />
          </div>
        )}
      </div>
      {notice && (
        <p className="notification-feedback" role="status">
          {notice}
        </p>
      )}
      {!preferencesOpen && !detail && (
        <div className="notification-panel-footer">
          <Button
            variant="link"
            endIcon="arrow"
            onClick={() => setPreferencesOpen(true)}
          >
            Notification preferences
          </Button>
        </div>
      )}
    </section>
  );
}
