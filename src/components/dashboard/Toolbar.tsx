import React from 'react';
import { FilePlus, Trash2, Download, BookOpen, Info, LogOut, Settings, ToggleLeft } from 'lucide-react';
import { ToolbarItem } from './ToolbarItem';
import { SyncComboButton } from './SyncComboButton';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { CommandBar } from '../toolbar/CommandBar';
import { useSyncStore } from '../../stores/syncStore';

interface ToolbarProps {
  onAuthority?: () => void;
  onAbout?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onEdit?: () => void;
  onCheckout?: () => void;
  onReturn?: () => void;
  onDashboard?: () => void;
  onPayment?: () => void;
  onAudit?: () => void;
  onFinancialReports?: () => void;
  onAcquisitions?: () => void;
  onReservation?: () => void;
  onSettings?: () => void;
  onShowLogs?: () => void;
  onImportMdb?: () => void;
  onImportAccounts?: () => void;
  onAttendanceDashboard?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAuthority, onAbout, onDelete, onExport, onEdit, onCheckout, onReturn, onDashboard, onPayment, onAudit, onFinancialReports, onAcquisitions, onReservation, onSettings, onShowLogs, onImportMdb, onImportAccounts, onAttendanceDashboard }) => {
  const { logout } = useAuthStore();
  const { syncNow } = useSyncStore();
  const navigate = useNavigate();
  const [isAdvanced, setIsAdvanced] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const location = useLocation();
  const isPatrons = location.pathname.startsWith('/patrons');

  const handleNew = () => {
    if (isPatrons) navigate('/patrons/new');
    else navigate('/catalog/new');
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-classic-grey dark:bg-dark-surface border-b border-white dark:border-dark-highlight shadow-[0_1px_0_#808080] dark:shadow-[0_1px_0_#1A1A1A] relative z-[100]">
      {isAdvanced ? (
        <CommandBar 
          onAuthority={onAuthority || (() => {})}
          onAbout={onAbout || (() => {})}
          onDelete={onDelete || (() => {})}
          onExport={onExport || (() => {})}
          onEdit={onEdit || (() => {})}
          onCheckout={onCheckout || (() => {})}
          onReturn={onReturn || (() => {})}
          onDashboard={onDashboard || (() => {})}
          onPayment={onPayment || (() => {})}
          onAudit={onAudit || (() => {})}
          onFinancialReports={onFinancialReports || (() => {})}
          onAcquisitions={onAcquisitions || (() => {})}
          onReservation={onReservation || (() => {})}
          onSettings={onSettings || (() => {})}
          onShowLogs={onShowLogs || (() => {})}
          onImportMdb={onImportMdb || (() => {})}
          onImportAccounts={onImportAccounts || (() => {})}
          onAttendanceDashboard={onAttendanceDashboard || (() => {})}
          onExit={handleLogout}
          onSync={syncNow}
          navigate={navigate}
        />
      ) : (
        <>
          <ToolbarItem 
            icon={FilePlus} 
            label="New" 
            onClick={handleNew} 
          />
          <ToolbarItem 
            icon={Trash2} 
            label="Delete" 
            onClick={onDelete} 
          />
          <ToolbarItem 
            icon={Download} 
            label="Export" 
            onClick={onExport} 
          />
          
          <div className="w-[1px] h-16 bg-gray-400 dark:bg-dark-border-light mx-1 shadow-[1px_0_0_white] dark:shadow-[1px_0_0_#404040]" />
          
          <ToolbarItem 
            icon={BookOpen} 
            label="Authority" 
            onClick={onAuthority} 
          />
          <ToolbarItem 
            icon={Info} 
            label="About" 
            onClick={onAbout} 
          />
          <ToolbarItem 
            icon={LogOut} 
            label="Exit" 
            onClick={handleLogout} 
          />
          
          <div className="w-[1px] h-16 bg-gray-400 dark:bg-dark-border-light mx-1 shadow-[1px_0_0_white] dark:shadow-[1px_0_0_#404040]" />
          
          <SyncComboButton onShowLogs={onShowLogs || (() => {})} />
        </>
      )}
      
      {/* Spacer */}
      <div className="flex-1 min-w-[20px]" />
      
      {/* Settings Button */}
      <ToolbarItem 
        icon={Settings} 
        label="Settings" 
        onClick={onSettings} 
      />
      
      {/* Mode Toggle Button */}
      <ToolbarItem 
        icon={ToggleLeft} 
        label={isAdvanced ? "Basic Mode" : "Adv. Mode"} 
        onClick={() => setIsAdvanced(!isAdvanced)} 
        className={isAdvanced ? "!shadow-bevel-sunken bg-blue-100/30 border border-blue-500" : "border-2 border-dashed border-gray-500"}
      />
      
      {/* Branding Logo Placeholder */}
      <div className="pr-4 text-right">
        <h1 className="text-xl font-bold tracking-tighter text-classic-blue dark:text-dark-accent italic">
          infoLib.
        </h1>
        <p className="text-[9px] text-gray-600 dark:text-dark-text-muted font-bold uppercase">
          Library Information System
        </p>
      </div>
    </div>
  );
};
