import type { ComponentPropsWithoutRef } from 'react';
import { classNames } from '../../lib/classNames';

export interface ToastProps extends ComponentPropsWithoutRef<'div'> {
  message?: string;
  variant?: 'message' | 'notification';
}

export function Toast({
  message,
  children,
  variant = 'message',
  className,
  ...props
}: ToastProps) {
  return (
    <div
      className={classNames(
        'toast',
        Boolean(message || children) && 'visible',
        className,
      )}
      data-variant={variant}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      {...props}
    >
      {children ?? message}
    </div>
  );
}
