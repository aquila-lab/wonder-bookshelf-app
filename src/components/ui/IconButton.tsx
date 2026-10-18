import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../../lib/classNames';
import { Icon, type IconName } from './Icon';

export interface IconButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'aria-label'
> {
  icon: IconName;
  'aria-label': string;
  variant?: 'surface' | 'ghost';
  size?: 'sm' | 'md';
}

export function IconButton({
  icon,
  variant = 'surface',
  size = 'md',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={classNames('icon-button', className)}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      <Icon name={icon} size="sm" />
    </button>
  );
}
