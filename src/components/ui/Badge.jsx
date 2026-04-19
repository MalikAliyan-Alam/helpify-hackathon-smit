import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-[#e6f4ea] text-[#1e8e3e] border border-[#e6f4ea]', // Green-ish
    destructive: 'bg-[#fce8e6] text-[#d93025] border border-[#fce8e6]', // Red-ish
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
    secondary: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#e8f0fe]', // Blue-ish
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
