import React from 'react';
import { TitleBar } from './TitleBar';
import { Toolbar } from '../dashboard/Toolbar';
import { BeveledBox } from '../common/BeveledBox';
import { AuthorityDialog } from '../catalog/AuthorityDialog';
import { DeleteDialog } from '../dashboard/DeleteDialog';
import { ExportDialog } from '../dashboard/ExportDialog';
import { CheckoutDialog } from '../circulation/CheckoutDialog';
import { ReturnDialog } from '../circulation/ReturnDialog';
import { CirculationDashboard } from '../circulation/CirculationDashboard';
import { PaymentDialog } from '../patrons/PaymentDialog';
import { FinancialReportsDialog } from '../patrons/FinancialReportsDialog';
import { AcquisitionsDialog } from '../inventory/AcquisitionsDialog';
import { AuditDialog } from '../inventory/AuditDialog';
import { ReservationDialog } from '../circulation/ReservationDialog';
import { EditCatalogDialog } from '../catalog/EditCatalogDialog';
import { AIChatBadge } from '../ai/AIChatBadge';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import { AboutDialog } from './AboutDialog';
import { SyncLogsDialog } from '../dashboard/SyncLogsDialog';
import { ImportMdbDialog } from '../management/ImportMdbDialog';
import { ImportAccountsDialog } from '../management/ImportAccountsDialog';
import { AttendanceDashboard } from '../attendance/AttendanceDashboard';
import { useAuthStore } from '../../stores/authStore';
import { useCatalogStore } from '../../stores/catalogStore';
import { usePatronStore } from '../../stores/patronStore';
import { useSyncStore } from '../../stores/syncStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { records, selectedId, deleteRecord, isEditDialogOpen, editingControlNo, setEditDialogOpen, setEditingControlNo } = useCatalogStore();
  const { patrons, selectedIdno, deletePatron } = usePatronStore();
  const { autoSyncEnabled, syncNow, schedule } = useSyncStore();
  const location = useLocation();
  const isPatrons = location.pathname.startsWith('/patrons');

  const [showAuthority, setShowAuthority] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [showReturn, setShowReturn] = React.useState(false);
  const [showCircDashboard, setShowCircDashboard] = React.useState(false);
  const [showPayment, setShowPayment] = React.useState(false);
  const [showFinancialReports, setShowFinancialReports] = React.useState(false);
  const [showAcquisitions, setShowAcquisitions] = React.useState(false);
  const [showAudit, setShowAudit] = React.useState(false);
  const [showReservation, setShowReservation] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showSyncLogs, setShowSyncLogs] = React.useState(false);
  const [showImportMdb, setShowImportMdb] = React.useState(false);
  const [showImportAccounts, setShowImportAccounts] = React.useState(false);
  const [showAttendanceDashboard, setShowAttendanceDashboard] = React.useState(false);
  const [importCsvPath, setImportCsvPath] = React.useState('');
  const [isImportMinimized, setIsImportMinimized] = React.useState(false);
  const [importBadgeStats, setImportBadgeStats] = React.useState({ current: 0, total: 0, isRunning: false });

  // ── Poll import status when minimized (for the floating badge) ──
  React.useEffect(() => {
    if (!isImportMinimized) return;
    const poll = async () => {
      try {
        const status = await invoke<{ is_running: boolean; current: number; total: number }>('get_import_status');
        setImportBadgeStats({ current: status.current, total: status.total, isRunning: status.is_running });
        if (!status.is_running) {
          // Import finished in background — auto-restore dialog to show final state
          setIsImportMinimized(false);
          setShowImportAccounts(true);
        }
      } catch { /* ignore */ }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [isImportMinimized]);

  // Smart Scheduled Auto-Sync: checks every 60s if the admin-configured time window has been reached
  const lastScheduledFire = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!autoSyncEnabled) return;

    const DAY_MAP: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };

    const checkSchedule = () => {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayName = DAY_MAP[now.getDay()];

      // Prevent duplicate fire for same day
      if (lastScheduledFire.current === todayKey) return;

      // Check if today is an active sync day
      const isDayActive = schedule.mode === 'everyday' || schedule.selectedDays.includes(todayName as any);
      if (!isDayActive) return;

      // Fire if current time matches or has passed the scheduled time (within the day)
      if (currentTime >= schedule.time) {
        lastScheduledFire.current = todayKey;
        console.log(`[AutoSync] Scheduled sync triggered at ${currentTime} (configured: ${schedule.time})`);
        syncNow();
      }
    };

    // Check immediately on mount
    checkSchedule();

    // Poll every 60 seconds (silent reset: schedule changes are picked up automatically)
    const interval = setInterval(checkSchedule, 60 * 1000);

    return () => clearInterval(interval);
  }, [autoSyncEnabled, syncNow, schedule]);

  const selectedRecord = records.find(r => r.id === selectedId);
  const selectedPatron = patrons.find(p => p.idno === selectedIdno);

  const confirmDelete = () => {
    if (isPatrons) {
      if (selectedIdno) {
        deletePatron(selectedIdno);
        setShowDelete(false);
      }
    } else {
      if (selectedId !== undefined) {
        deleteRecord(selectedId);
        setShowDelete(false);
      }
    }
  };

  const handleEdit = () => {
    if (isPatrons) {
      if (selectedIdno) navigate(`/patrons/edit/${selectedIdno}`);
      else alert('Please select a patron to edit.');
    } else {
      if (selectedId) {
        const record = records.find(r => r.id === selectedId);
        if (record?.controlno) {
          setEditingControlNo(record.controlno);
          setEditDialogOpen(true);
        }
      } else {
        alert('Please select a record to edit.');
      }
    }
  };

  const handleClose = () => {
    try {
      invoke('quit_app');
    } catch (e) {
      console.error('Tauri quit failed:', e);
      logout(); // Fallback
    }
  };

  const handleImportAccounts = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'CSV', extensions: ['csv'] }]
      });
      if (selected && typeof selected === 'string') {
        setImportCsvPath(selected);
        setShowImportAccounts(true);
      }
    } catch (e) {
      console.error('Import failed:', e);
      alert('Import failed: ' + e);
    }
  };

  return (
    <div className="min-h-screen bg-[#808080] dark:bg-[#1A1A1A] p-0.5 sm:p-2 md:p-4 flex items-center justify-center">
      <BeveledBox variant="raised" className="w-full h-full max-w-7xl mx-auto flex flex-col bg-[#D4D0C8] dark:bg-dark-surface">
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
              onEdit={handleEdit}
              onCheckout={() => {
                if (isPatrons) {
                  if (selectedIdno) setShowCheckout(true);
                  else alert('Please select a patron to issue items to.');
                } else {
                  alert('Please switch to Patrons view to manage circulation.');
                }
              }}
              onReturn={() => setShowReturn(true)}
              onDashboard={() => setShowCircDashboard(true)}
              onPayment={() => {
                if (isPatrons) {
                  if (selectedIdno) setShowPayment(true);
                  else alert('Please select a patron to record payment.');
                } else {
                  alert('Please switch to Patrons view to manage payments.');
                }
              }}
              onDelete={() => {
                if (isPatrons) {
                  if (selectedIdno) setShowDelete(true);
                  else alert('Please select a patron to delete.');
                } else {
                  if (selectedId) setShowDelete(true);
                  else alert('Please select a record to delete.');
                }
              }}
              onAudit={() => setShowAudit(true)}
              onFinancialReports={() => setShowFinancialReports(true)}
              onAcquisitions={() => setShowAcquisitions(true)}
              onReservation={() => setShowReservation(true)}
              onSettings={() => setShowSettings(true)}
              onShowLogs={() => setShowSyncLogs(true)}
              onImportMdb={() => setShowImportMdb(true)}
              onImportAccounts={handleImportAccounts}
              onAttendanceDashboard={() => setShowAttendanceDashboard(true)}
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
      {showCheckout && <CheckoutDialog onClose={() => setShowCheckout(false)} />}
      {showReturn && <ReturnDialog onClose={() => setShowReturn(false)} />}
      {showCircDashboard && <CirculationDashboard onClose={() => setShowCircDashboard(false)} />}
      {showPayment && <PaymentDialog onClose={() => setShowPayment(false)} />}
      {showFinancialReports && <FinancialReportsDialog onClose={() => setShowFinancialReports(false)} />}
      {showAcquisitions && <AcquisitionsDialog onClose={() => setShowAcquisitions(false)} />}
      {showAudit && <AuditDialog onClose={() => setShowAudit(false)} />}
      {showReservation && <ReservationDialog onClose={() => setShowReservation(false)} />}
      {showDelete && !isPatrons && selectedRecord && (
        <DeleteDialog 
          controlNo={selectedRecord.controlno || selectedRecord.id.toString()} 
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {showDelete && isPatrons && selectedPatron && (
        <DeleteDialog 
          controlNo={selectedPatron.idno} 
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {isEditDialogOpen && editingControlNo && (
        <EditCatalogDialog 
          controlno={editingControlNo} 
          onClose={() => setEditDialogOpen(false)} 
        />
      )}
      
      <AIChatBadge />
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      {showSyncLogs && <SyncLogsDialog onClose={() => setShowSyncLogs(false)} />}
      {showAttendanceDashboard && <AttendanceDashboard onClose={() => setShowAttendanceDashboard(false)} />}
      {showImportMdb && <ImportMdbDialog onClose={() => setShowImportMdb(false)} />}
      {showImportAccounts && !isImportMinimized && importCsvPath && (
        <ImportAccountsDialog 
          csvPath={importCsvPath} 
          onClose={() => {
            setShowImportAccounts(false);
            setIsImportMinimized(false);
            setImportCsvPath('');
          }}
          onMinimize={() => {
            setShowImportAccounts(false);
            setIsImportMinimized(true);
          }}
        />
      )}

      {/* Floating Import Badge — shown when import is minimized to background */}
      {isImportMinimized && (
        <button
          onClick={() => {
            setIsImportMinimized(false);
            setShowImportAccounts(true);
          }}
          className="fixed bottom-4 right-20 z-[90] flex items-center gap-2 px-4 py-2
            bg-blue-700 dark:bg-blue-800 text-white text-xs font-bold uppercase
            border-2 border-t-blue-400 border-l-blue-400 border-b-blue-900 border-r-blue-900
            shadow-lg hover:bg-blue-600 active:shadow-bevel-sunken
            animate-pulse transition-all cursor-pointer"
          title="Click to restore Import dialog"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
          <span>Importing: {importBadgeStats.current}/{importBadgeStats.total}</span>
          <span className="text-blue-200">▲ Restore</span>
        </button>
      )}
    </div>
  );
};
