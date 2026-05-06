import React from 'react';
import { UserProfile } from './UserProfile';

interface TitleBarProps {
  title?: string;
  onClose?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title = 'infoLib Library Management System',
  onClose
}) => {
  return (
    <div className="h-8 bg-gradient-to-b from-[#A6CAF0] to-[#7FA8E0] dark:from-[#1E3A6E] dark:to-[#2A4F8A] flex items-center justify-between px-2 select-none">
      <div className="flex items-center gap-2">
        <UserProfile />
        <span className="text-white dark:text-dark-text text-sm font-medium drop-shadow-sm ml-1">
          {title}
        </span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="w-6 h-6 bg-[#D4D0C8] dark:bg-dark-panel border border-[#808080] dark:border-dark-border-dark shadow-bevel-raised flex items-center justify-center hover:bg-[#E0E0E0] dark:hover:bg-dark-surface-alt active:shadow-bevel-sunken"
          aria-label="Close"
        >
          <span className="text-[#000080] dark:text-dark-accent text-xs font-bold">×</span>
        </button>
      )}
    </div>
  );
};
