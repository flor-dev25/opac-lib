import React from 'react';
import { ClipboardList, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { useSyncStore } from '../../stores/syncStore';
import { BeveledBox } from '../common/BeveledBox';

interface SyncLogsDialogProps {
  onClose: () => void;
}

export const SyncLogsDialog: React.FC<SyncLogsDialogProps> = ({ onClose }) => {
  const { sessions, clearLogs, isSyncing, syncNow, lastSync, toggleSessionExpanded, syncTargets } = useSyncStore();

  return (
    <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#D4D0C8] dark:bg-dark-surface border-t-2 border-l-2 border-white dark:border-dark-highlight border-b-2 border-r-2 border-gray-800 dark:border-dark-shadow w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[80vh]">
        {/* Title Bar */}
        <div className="title-bar-gjc">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} />
            <span>
              {syncTargets.firebase && syncTargets.supabase 
                ? "Dual Synchronization Logs" 
                : syncTargets.supabase 
                  ? "Supabase Synchronization Logs" 
                  : syncTargets.firebase 
                    ? "Firebase Synchronization Logs" 
                    : "Synchronization Logs"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-gray-800 text-[10px] font-bold leading-none hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Toolbar in Dialog */}
        <div className="p-2 bg-[#D4D0C8] dark:bg-dark-surface border-b border-gray-400 dark:border-dark-border-dark flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="btn-classic px-3 py-1 flex items-center gap-2 text-xs"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={clearLogs}
              className="btn-classic px-3 py-1 flex items-center gap-2 text-xs"
            >
              <Trash2 size={14} />
              Clear Logs
            </button>
          </div>
          {lastSync && (
            <span className="text-[10px] font-bold text-[#000080] dark:text-dark-accent">
              LAST SUCCESSFUL SYNC: {new Date(lastSync).toLocaleString()}
            </span>
          )}
        </div>

        {/* Logs Container */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <BeveledBox variant="sunken" className="flex-1 bg-white dark:bg-dark-input overflow-y-auto p-2 font-mono">
            {sessions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
                No synchronization events recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session, index) => (
                  <div key={session.id} className="border border-gray-300 dark:border-dark-border-dark bg-white dark:bg-dark-input">
                    {/* Accordion Header */}
                    <div 
                      className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-alt transition-colors border-b border-transparent data-[expanded=true]:border-gray-200 dark:data-[expanded=true]:border-dark-border-dark"
                      data-expanded={session.expanded}
                      onClick={() => toggleSessionExpanded(session.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {session.status === 'completed' ? (
                            <CheckCircle size={14} className="text-green-600" />
                          ) : session.status === 'failed' ? (
                            <XCircle size={14} className="text-red-600" />
                          ) : (
                            index === 0 ? <RefreshCw size={14} className="text-blue-600 animate-spin" /> : <XCircle size={14} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-gray-800 dark:text-dark-text">
                            {new Date(session.startTime).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-dark-text-muted">
                            {session.summary}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400 font-mono text-[10px]">
                        {session.expanded ? '▼' : '▶'}
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {session.expanded && (
                      <div className="p-2 bg-gray-50 dark:bg-[#1a1b1e] space-y-1 border-t border-gray-200 dark:border-dark-border-dark max-h-60 overflow-y-auto">
                        {session.details.map((detail, idx) => (
                          <div key={idx} className="flex gap-2 text-[10px] items-start">
                            <span className="text-gray-400 shrink-0 font-mono">[{new Date(detail.timestamp).toLocaleTimeString()}]</span>
                            {detail.type === 'info' && <span className="text-blue-500 shrink-0">INFO:</span>}
                            {detail.type === 'success' && <span className="text-green-500 shrink-0">SUCCESS:</span>}
                            {detail.type === 'error' && <span className="text-red-500 shrink-0 font-bold">ERROR:</span>}
                            <span className="text-gray-700 dark:text-gray-300 break-all">{detail.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </BeveledBox>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#D4D0C8] dark:bg-dark-surface border-t border-white dark:border-dark-highlight flex justify-end">
          <button
            onClick={onClose}
            className="btn-classic px-8 py-1.5 text-sm font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
