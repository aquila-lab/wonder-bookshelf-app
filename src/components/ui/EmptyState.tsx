import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: IconName;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="empty">
      {icon && <Icon name={icon} size="lg" />}
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
