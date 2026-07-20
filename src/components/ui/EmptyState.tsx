import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) => {
  return (
    <div className="rounded-card border border-dashed border-light-sandy bg-cream/60 px-6 py-10 text-center">
      <h3 className="font-display text-xl font-semibold text-dark-brown">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-brown">{description}</p>
      {actionLabel && actionTo ? (
        <div className="mt-5">
          <Link to={actionTo}>
            <Button>{actionLabel}</Button>
          </Link>
        </div>
      ) : null}
      {actionLabel && onAction && !actionTo ? (
        <div className="mt-5">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;
