import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  onActionClick,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-light-sandy bg-cream/60 px-6 py-10 text-center">
      <h3 className="heading-5 text-dark-brown">{title}</h3>
      <p className="body-6 mx-auto mt-2 max-w-md text-gray-brown">{description}</p>
      {actionLabel && actionTo ? (
        <div className="mt-5">
          <Link to={actionTo} onClick={onActionClick}>
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
