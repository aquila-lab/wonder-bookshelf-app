import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createReleaseNotification } from '../../data/initialNotifications';
import { useNotifications } from '../../hooks/useNotifications';
import type { Book } from '../../types/book';
import type { BookNotification } from '../../types/notification';
import { NotificationBell } from './NotificationBell';
import { NotificationPanel } from './NotificationPanel';
import { NotificationToast } from './NotificationToast';

export interface NotificationCenterProps {
  books: Book[];
  onOpenBook: (book: Book) => void;
  onBrowse: () => void;
  onRefresh?: () => void;
}

export function NotificationCenter({
  books,
  onOpenBook,
  onBrowse,
  onRefresh = () => window.location.reload(),
}: NotificationCenterProps) {
  const notifications = useNotifications();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Extract<
    BookNotification,
    { kind: 'milestone' }
  > | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const demoEnabled =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get('notificationsDemo') ===
      '1';
  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    setDetail(null);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      )
        close();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', keydown);
    };
  }, [open, close]);

  const sendDemo = useCallback(() => {
    return notifications.receive(
      createReleaseNotification(`demo-${crypto.randomUUID()}`, Date.now()),
    );
  }, [notifications.receive]);

  useEffect(() => {
    if (!demoEnabled) return;
    window.addEventListener('bookshelf:notify', sendDemo);
    return () => window.removeEventListener('bookshelf:notify', sendDemo);
  }, [demoEnabled, sendDemo]);

  function activate(notification: BookNotification) {
    notifications.markRead(notification.id);
    if (notification.kind === 'milestone') {
      setDetail(notification);
      setOpen(true);
    } else if (notification.kind === 'system') {
      close();
      onRefresh();
    } else {
      const book = books.find((item) => item.id === notification.bookId);
      if (book) {
        close();
        onOpenBook(book);
      }
    }
  }

  const arrival = notifications.arrival;
  const arrivalBook =
    arrival && 'bookId' in arrival
      ? books.find((book) => book.id === arrival.bookId)
      : undefined;

  return (
    <div className="notification-center" ref={containerRef}>
      <NotificationBell
        unreadCount={notifications.unreadCount}
        open={open}
        panelId={panelId}
        buttonRef={buttonRef}
        onClick={() => {
          if (open) close(true);
          else setOpen(true);
        }}
      />
      {open && (
        <NotificationPanel
          id={panelId}
          books={books}
          notifications={notifications}
          detail={detail}
          onBack={() => setDetail(null)}
          onClose={() => close(true)}
          onBrowse={() => {
            close();
            onBrowse();
          }}
          onActivate={activate}
          onDemo={
            demoEnabled
              ? () => {
                  if (sendDemo()) close(true);
                }
              : undefined
          }
        />
      )}
      {arrival &&
        createPortal(
          <NotificationToast
            key={arrival.id}
            notification={arrival}
            book={arrivalBook}
            onActivate={activate}
            onDismiss={notifications.dismissArrival}
          />,
          document.body,
        )}
    </div>
  );
}
