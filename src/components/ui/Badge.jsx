import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-[var(--badge-gray-bg)] text-[var(--badge-gray-text)] border border-[var(--border-color)]',
    primary: 'bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] border border-[var(--badge-green-bg)]',
    destructive: 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] border border-[var(--badge-red-bg)]',
    outline: 'border border-[var(--border-color)] text-[var(--text-secondary)] bg-transparent',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--accent)] border border-[var(--border-color)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
