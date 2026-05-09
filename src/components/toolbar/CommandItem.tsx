import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CommandItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  shortcut?: string;
  disabled?: boolean;
}

export const CommandItem: React.FC<CommandItemProps> = ({ icon: Icon, label, onClick, shortcut, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
      ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-blue-600 hover:text-white dark:hover:bg-dark-selection'}
      transition-colors group`}
  >
    <div className="flex items-center justify-center w-5">
      <Icon size={16} className="text-gray-600 dark:text-dark-text group-hover:text-inherit" />
    </div>
    <span className="flex-1">{label}</span>
    {shortcut && <span className="text-[10px] opacity-60 ml-4 font-mono">{shortcut}</span>}
  </button>
);
