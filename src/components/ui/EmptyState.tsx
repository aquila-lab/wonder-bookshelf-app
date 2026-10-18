import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
