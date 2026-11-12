import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={['animate-pulse rounded-md bg-light-sandy', className].filter(Boolean).join(' ')}
    aria-hidden="true"
  />
);

interface SkeletonBlockProps {
  label?: string;
}

export const ArticleListSkeleton: React.FC<SkeletonBlockProps> = ({
  label = 'Загрузка…',
}) => (
  <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">{label}</span>
    {[0, 1, 2].map((index) => (
      <div
        key={index}
        className="rounded-2xl border border-light-sandy bg-light-text p-5 shadow-soft"
      >
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
      </div>
    ))}
  </div>
);

export default Skeleton;
