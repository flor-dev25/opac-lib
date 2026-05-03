import React from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { DataGrid } from '../common/DataGrid';

interface AuthorityDialogProps {
  onClose: () => void;
}

const AUTHOR_MOCK = [
  { id: 1, name: 'Cormen, Thomas H.' },
  { id: 2, name: 'Martin, Robert C.' },
  { id: 3, name: 'Hunt, Andrew' },
  { id: 4, name: 'Gamma, Erich' },
];

const SUBJECT_MOCK = [
  { id: 1, name: 'Algorithms' },
  { id: 2, name: 'Software Engineering' },
  { id: 3, name: 'Computer Networking' },
  { id: 4, name: 'Data Structures' },
];

export const AuthorityDialog: React.FC<AuthorityDialogProps> = ({ onClose }) => {
  const [type, setType] = React.useState<'author' | 'subject'>('author');
  const [selectedId, setSelectedId] = React.useState<number | undefined>(1);
  const [editValue, setEditValue] = React.useState('');

  const data = type === 'author' ? AUTHOR_MOCK : SUBJECT_MOCK;
  const columns = [{ key: 'name', header: type === 'author' ? 'Author Name' : 'Subject Heading', width: '100%' }];

  React.useEffect(() => {
    const selected = data.find(item => item.id === selectedId);
    if (selected) setEditValue(selected.name);
  }, [selectedId, type, data]);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <BeveledBox variant="raised" className="w-full max-w-lg bg-classic-grey shadow-2xl flex flex-col">
        {/* Title Bar */}
        <div className="bg-classic-blue-gradient px-2 py-1 flex items-center justify-between text-white font-bold text-sm">
          <span>Authority Control</span>
          <button onClick={onClose} className="hover:bg-red-500 px-1">✕</button>
        </div>

        <div className="p-4 space-y-4 flex-1 flex flex-col min-h-[400px]">
          {/* Category Toggle */}
          <div className="flex gap-1">
            <button 
              onClick={() => setType('author')}
              className={`btn-classic px-4 h-7 ${type === 'author' ? 'bg-gray-200 font-bold' : ''}`}
            >
              Author Authority
            </button>
            <button 
              onClick={() => setType('subject')}
              className={`btn-classic px-4 h-7 ${type === 'subject' ? 'bg-gray-200 font-bold' : ''}`}
            >
              Subject Authority
            </button>
          </div>

          {/* System Warning */}
          <div className="text-red-600 font-bold text-center text-xs uppercase leading-tight bg-white/50 p-2 border border-red-200 italic">
            NOTE : CLOSE ALL THE WORKSTATIONS BEFORE UPDATING THE AUTHORITY
          </div>

          {/* List Area */}
          <div className="flex-1 min-h-[200px]">
            <DataGrid 
              columns={columns} 
              data={data} 
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
            />
          </div>

          {/* Edit Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Edit / New Entry:</label>
            <input 
              type="text" 
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="input-classic w-full h-8" 
            />
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-classic px-6 h-8 font-bold">Update</button>
            <button className="btn-classic px-6 h-8 text-red-700">Delete</button>
            <button onClick={onClose} className="btn-classic px-6 h-8">Exit</button>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
