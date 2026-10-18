import { classNames } from '../../lib/classNames';

export interface ToastProps {
  message: string;
  className?: string;
}

export function Toast({ message, className }: ToastProps) {
  return (
    <div
      className={classNames('toast', Boolean(message) && 'visible', className)}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
