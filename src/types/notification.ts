export type NotificationKind = 'release' | 'reminder' | 'milestone' | 'system';

interface NotificationBase {
  id: string;
  category: string;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  isDemo: boolean;
  snoozedUntil?: number;
}

export type BookNotification = NotificationBase &
  (
    | { kind: 'release' | 'reminder'; bookId: string }
    | {
        kind: 'milestone';
        bookId: string;
        progress: { completed: number; goal: number; year: number };
      }
    | { kind: 'system' }
  );

export type NotificationPreferences = Record<NotificationKind, boolean>;

export interface NotificationState {
  version: 1;
  items: BookNotification[];
  preferences: NotificationPreferences;
}
