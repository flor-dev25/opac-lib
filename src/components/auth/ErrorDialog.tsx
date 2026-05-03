import React from 'react';
import { BeveledBox } from '../common/BeveledBox';

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
      <BeveledBox className="w-[220px] h-[160px] flex flex-col overflow-hidden bg-classic-grey" padding="p-0">
        {/* Title Bar */}
        <div className="title-bar flex-shrink-0">
          <span>Login</span>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-red-600 shadow-bevel-raised flex items-center justify-center text-white text-xs"
          >
            X
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-white flex items-center justify-center p-4">
          <p className="text-sm font-sans text-black text-center">{message}</p>
        </div>

        {/* Footer Area */}
        <div className="h-14 bg-classic-grey flex items-center justify-center flex-shrink-0">
          <button 
            onClick={onClose}
            className="btn-classic min-w-[80px]"
            autoFocus
          >
            OK
          </button>
        </div>
      </BeveledBox>
    </div>
  );
};
