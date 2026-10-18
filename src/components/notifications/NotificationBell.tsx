import type { Ref } from 'react';
import { Badge, IconButton } from '../ui';

export interface NotificationBellProps {
  unreadCount: number;
  open: boolean;
  panelId: string;
  onClick: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}

export function NotificationBell({
  unreadCount,
  open,
  panelId,
  onClick,
  buttonRef,
}: NotificationBellProps) {
  return (
    <div className="notification-bell">
      <IconButton
        ref={buttonRef}
        icon="bell"
        aria-label={
          unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={onClick}
      />
      {unreadCount > 0 && (
        <Badge
          className="notification-count"
          variant="solid"
          size="counter"
          aria-hidden="true"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </div>
  );
}
