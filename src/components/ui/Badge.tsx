import type { ComponentPropsWithoutRef } from 'react';
import { classNames } from '../../lib/classNames';

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  variant?: 'subtle' | 'solid';
}

export function Badge({ variant = 'subtle', className, ...props }: BadgeProps) {
  return (
    <span
      className={classNames('badge', className)}
      data-variant={variant}
      {...props}
    />
  );
}
