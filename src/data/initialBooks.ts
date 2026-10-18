import type { Book } from '../types/book';

export const initialBooks: Book[] = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Nonfiction',
    categories: ['Nonfiction', 'Habits'],
    cover: '/covers/atomic-habits.jpg',
    description:
      'A practical guide to building good habits, breaking bad ones, and making small changes that last.',
  },
  {
    id: 'crying-in-h-mart',
    title: 'Crying in H Mart',
    author: 'Michelle Zauner',
    genre: 'Memoir',
    categories: ['Memoir'],
    cover: '/covers/crying-in-h-mart.jpg',
    description:
      'Michelle Zauner reflects on family, food, grief, and her Korean American identity.',
  },
  {
    id: 'art-of-noticing',
    title: 'The Art of Noticing',
    author: 'Rob Walker',
    genre: 'Nonfiction',
    categories: ['Nonfiction', 'Creativity'],
    cover: '/covers/art-of-noticing.jpg',
    description:
      'An invitation to pay attention, spark curiosity, and rediscover the world around you through small creative exercises.',
  },
  {
    id: 'creative-act',
    title: 'The Creative Act',
    subtitle: 'A Way of Being',
    author: 'Rick Rubin',
    genre: 'Nonfiction',
    categories: ['Nonfiction', 'Creativity', 'Philosophy'],
    cover: '/covers/creative-act.jpg',
    edition: 'Hardcover edition',
    publisher: 'Penguin Press',
    published: 'January 17, 2023',
    pages: 432,
    isbn: '9780593652886',
    description:
      'Rick Rubin explores creativity as a way of paying attention to the world. Drawing on his work with artists, he reflects on curiosity, experimentation, and making space for ideas.\n\nAn invitation to develop your own creative practice, whether you make music, write, design, or simply want to see everyday life differently.',
  },
  {
    id: 'midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    categories: ['Fiction'],
    cover: '/covers/midnight-library.jpg',
    description:
      'Between life and death, a library offers Nora Seed the chance to explore the lives she could have lived.',
  },
  {
    id: 'tomorrow',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    displayTitle: 'Tomorrow, and',
    author: 'Gabrielle Zevin',
    genre: 'Fiction',
    categories: ['Fiction'],
    cover: '/covers/tomorrow.jpg',
    description:
      'Two childhood friends reunite to make video games in a story of creativity, ambition, and a complicated lifelong friendship.',
  },
];
