import React from 'react';
import { BeveledBox } from './BeveledBox';
import { TitleBar } from '../layout/TitleBar';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MessageDialogProps {
  title: string;
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const MessageDialog: React.FC<MessageDialogProps> = ({ 
  title, 
  message, 
  type = 'success', 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[400] p-4 backdrop-blur-sm">
      <BeveledBox variant="raised" className="w-[350px] bg-classic-grey dark:bg-dark-surface shadow-2xl flex flex-col overflow-hidden">
        <TitleBar title={title} onClose={onClose} hideUserProfile={true} />
        
        <div className="p-6 flex flex-col items-center gap-4 text-center">
          <div className={`p-3 rounded-full ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {type === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
          </div>
          
          <div className="space-y-1">
            <p className="font-bold text-gray-900 dark:text-dark-text">{message}</p>
            <p className="text-xs text-gray-500 dark:text-dark-text-muted">
              {type === 'success' ? 'The document has been saved successfully.' : 'An error occurred while saving the document.'}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="btn-classic w-full h-9 font-bold mt-2"
          >
            OK
          </button>
        </div>
      </BeveledBox>
    </div>
  );
};
