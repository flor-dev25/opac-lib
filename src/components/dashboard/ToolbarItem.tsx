import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolbarItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const ToolbarItem: React.FC<ToolbarItemProps> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center w-20 h-20 gap-1
        btn-classic group
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-gray-200'}
      `}
    >
      <div className="p-1 group-active:translate-y-0.5 transition-transform">
        <Icon size={32} strokeWidth={1.5} className="text-[#404040]" />
      </div>
      <span className="text-[11px] font-medium text-black group-active:translate-y-0.5 transition-transform">
        {label}
      </span>
    </button>
  );
};
