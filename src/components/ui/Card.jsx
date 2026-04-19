import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-white rounded-[24px] p-6 shadow-sm border border-gray-100', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('font-semibold leading-none tracking-tight text-lg text-[#2b3231]', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('flex items-center pt-4 mt-auto', className)} {...props}>
      {children}
    </div>
  );
}
