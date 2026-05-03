import React from 'react';

interface TitleBarProps {
  title?: string;
  onClose?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title = 'infoLib Library Management System',
  onClose
}) => {
  return (
    <div className="h-8 bg-gradient-to-b from-[#A6CAF0] to-[#7FA8E0] flex items-center justify-between px-2 select-none">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-[#D4D0C8] border border-[#808080] shadow-bevel-raised flex items-center justify-center">
          <div className="w-2 h-2 bg-[#000080] rounded-sm" />
        </div>
        <span className="text-white text-sm font-medium drop-shadow-sm">
          {title}
        </span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="w-6 h-6 bg-[#D4D0C8] border border-[#808080] shadow-bevel-raised flex items-center justify-center hover:bg-[#E0E0E0] active:shadow-bevel-sunken"
          aria-label="Close"
        >
          <span className="text-[#000080] text-xs font-bold">×</span>
        </button>
      )}
    </div>
  );
};
