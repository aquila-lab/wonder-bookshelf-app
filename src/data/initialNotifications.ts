import type { BookNotification } from '../types/notification';

// Illustrative activity for the offline Bookshelf demo, not a live release feed.
export function createReleaseNotification(
  id: string,
  createdAt: number,
): BookNotification {
  return {
    id,
    kind: 'release',
    category: 'New from Rick Rubin',
    title: 'The Creative Act',
    message: 'A new title from an author on your shelf.',
    bookId: 'creative-act',
    createdAt,
    read: false,
    isDemo: true,
  };
}

export function createInitialNotifications(now: number): BookNotification[] {
  return [
    createReleaseNotification('sample-release', now - 12 * 60_000),
    {
      id: 'sample-reminder',
      kind: 'reminder',
      category: 'Still on your list',
      title: 'The Midnight Library',
      message: 'Saved three weeks ago. A chapter tonight?',
      bookId: 'midnight-library',
      createdAt: now - 2 * 60 * 60_000,
      read: false,
      isDemo: true,
    },
    {
      id: 'sample-milestone',
      kind: 'milestone',
      category: 'Reading milestone',
      title: 'Three books, one good habit.',
      message: 'One more to your yearly goal of 4.',
      bookId: 'atomic-habits',
      progress: { completed: 3, goal: 4, year: new Date(now).getFullYear() },
      createdAt: now - 24 * 60 * 60_000,
      read: false,
      isDemo: true,
    },
    {
      id: 'sample-update',
      kind: 'system',
      category: 'Bookshelf update',
      title: 'A fresh chapter for Bookshelf',
      message: 'A new version is ready when you are.',
      createdAt: now - 3 * 24 * 60 * 60_000,
      read: true,
      isDemo: true,
    },
  ];
}
