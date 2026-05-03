import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BeveledBoxProps {
  variant?: 'raised' | 'sunken';
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export const BeveledBox: React.FC<BeveledBoxProps> = ({ 
  variant = 'raised', 
  children, 
  className,
  padding = 'p-1'
}) => {
  return (
    <div className={cn(
      padding,
      variant === 'raised' ? 'shadow-bevel-raised' : 'shadow-bevel-sunken',
      className
    )}>
      {children}
    </div>
  );
};
