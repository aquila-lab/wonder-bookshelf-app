import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { BookCover } from './BookCover';

test('failed covers use a readable fallback and a replacement source can load', () => {
  const book = { title: 'Demo Book', author: 'Author', cover: '/missing.jpg' };
  const { rerender } = render(<BookCover book={book} />);
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('img').tagName).toBe('DIV');
  expect(screen.getByText('Demo Book')).toBeTruthy();
  rerender(<BookCover book={{ ...book, cover: '/replacement.jpg' }} />);
  expect(screen.getByRole('img').getAttribute('src')).toBe('/replacement.jpg');
});
