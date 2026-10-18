import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../../lib/classNames';
import { Icon, type IconName } from './Icon';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: IconName;
  endIcon?: IconName;
}

export function Button({
  variant = 'secondary',
  size = 'sm',
  startIcon,
  endIcon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames('button', className)}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {startIcon && <Icon name={startIcon} />}
      {children}
      {endIcon && <Icon name={endIcon} />}
    </button>
  );
}
