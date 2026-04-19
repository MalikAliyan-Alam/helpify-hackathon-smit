import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, variant = 'default', size = 'default', children, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-[#129780] text-white hover:bg-[#0e7866]',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-900',
    ghost: 'hover:bg-gray-100 text-gray-900',
    secondary: 'bg-white text-gray-900 shadow-sm border border-gray-200 hover:bg-gray-50',
    dark: 'bg-[#2b3231] text-white hover:bg-[#1f2524]',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
