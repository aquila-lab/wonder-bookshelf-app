import type { ComponentPropsWithoutRef } from 'react';
import { classNames } from '../../lib/classNames';

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  variant?: 'subtle' | 'solid';
  size?: 'sm' | 'counter';
}

export function Badge({
  variant = 'subtle',
  size = 'sm',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames('badge', className)}
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
}
