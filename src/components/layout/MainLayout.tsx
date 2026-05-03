import React from 'react';
import { TitleBar } from './TitleBar';
import { Toolbar } from '../dashboard/Toolbar';
import { BeveledBox } from '../common/BeveledBox';
import { AuthorityDialog } from '../catalog/AuthorityDialog';
import { AboutDialog } from '../common/AboutDialog';
import { DeleteDialog } from '../dashboard/DeleteDialog';
import { ExportDialog } from '../dashboard/ExportDialog';
import { useAuthStore } from '../../stores/authStore';
import { useCatalogStore } from '../../stores/catalogStore';
import { useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout } = useAuthStore();
  const { records, selectedId, deleteRecord } = useCatalogStore();
  const navigate = useNavigate();
  const [showAuthority, setShowAuthority] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);

  const selectedRecord = records.find(r => r.id === selectedId);

  const confirmDelete = () => {
    if (selectedId !== undefined) {
      deleteRecord(selectedId);
      setShowDelete(false);
    }
  };

  const handleClose = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#808080] p-0.5 sm:p-2 md:p-4 flex items-center justify-center">
      <BeveledBox variant="raised" className="w-full h-full max-w-7xl mx-auto flex flex-col bg-[#D4D0C8]">
        <TitleBar
          title="infoLib Library Management System"
          onClose={handleClose}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Toolbar Slot (T02) */}
          <header id="layout-toolbar">
            <Toolbar 
              onAuthority={() => setShowAuthority(true)} 
              onAbout={() => setShowAbout(true)} 
              onExport={() => setShowExport(true)}
              onDelete={() => {
                if (selectedId) setShowDelete(true);
                else alert('Please select a record to delete.');
              }}
            />
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-2">
            {children}
          </main>
        </div>
      </BeveledBox>

      {/* Global Dialogs */}
      {showAuthority && <AuthorityDialog onClose={() => setShowAuthority(false)} />}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
      {showDelete && selectedRecord && (
        <DeleteDialog 
          controlNo={selectedRecord.controlNo || selectedRecord.id.toString()} 
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
};
