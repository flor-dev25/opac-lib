import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { BeveledBox } from '../common/BeveledBox';
import { TitleBar } from '../layout/TitleBar';
import { Loader2, Pause, Play, Square, Minimize2, AlertTriangle, FilePlus } from 'lucide-react';

// ─── Types matching Rust backend ────────────────────────────────────────────

interface ImportProgressEntry {
  current: number;
  total: number;
  last_name: string;
  status: 'success' | 'error';
  message: string;
}

interface ImportProgressBatch {
  entries: ImportProgressEntry[];
  current: number;
  total: number;
  success_count: number;
  error_count: number;
  is_paused: boolean;
  is_done: boolean;
  is_stopped: boolean;
}

interface LogEntry {
  id: string;       // stable unique key — critical for flicker-free rendering
  name: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

interface ImportAccountsDialogProps {
  csvPath: string;
  onClose: () => void;
  onMinimize?: () => void;  // allows parent to hide the dialog while import continues
}

// ─── Memoized Log Row — prevents re-renders of unchanged rows ───────────────

const LogRow = React.memo(({ log }: { log: LogEntry }) => (
  <div className="flex gap-2 leading-tight py-[1px]">
    <span className="text-gray-500 shrink-0 tabular-nums">[{log.timestamp}]</span>
    <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>
      {log.status === 'success' ? '✔' : '✘'}
    </span>
    <span className="font-bold text-white shrink-0">{log.name}:</span>
    <span className="truncate text-[#00FF00]">{log.message}</span>
  </div>
));
LogRow.displayName = 'LogRow';

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_VISIBLE_LOGS = 800;  // Keep 800 in DOM; older entries are discarded

// ─── Main Component ─────────────────────────────────────────────────────────

export const ImportAccountsDialog: React.FC<ImportAccountsDialogProps> = ({
  csvPath,
  onClose,
  onMinimize,
}) => {
  // ── State ──
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    success: 0, error: 0, total: 0, current: 0,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [groupName, setGroupName] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [hasStarted, setHasStarted] = useState(false);

  // ── Refs ──
  const logContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);        // auto-scroll unless user scrolled up
  const pendingLogsRef = useRef<LogEntry[]>([]);  // rAF buffer
  const rafIdRef = useRef<number | null>(null);
  const idCounterRef = useRef(0);

  // ── Auto-scroll detection: if user scrolls up, pause auto-scroll ──
  const handleScroll = useCallback(() => {
    const el = logContainerRef.current;
    if (!el) return;
    const threshold = 60; // px from bottom
    autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  // ── Flush pending logs into state using requestAnimationFrame ──
  // This batches React state updates to the browser's paint cycle,
  // preventing the "1s black / 1s data" flicker the boss reported.
  const scheduleFlush = useCallback(() => {
    if (rafIdRef.current !== null) return; // already scheduled
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const pending = pendingLogsRef.current;
      if (pending.length === 0) return;
      pendingLogsRef.current = [];

      setLogs(prev => {
        const combined = [...prev, ...pending];
        // Trim to MAX_VISIBLE_LOGS from the end
        return combined.length > MAX_VISIBLE_LOGS
          ? combined.slice(-MAX_VISIBLE_LOGS)
          : combined;
      });
    });
  }, []);

  // ── Scroll to bottom after logs update (only if autoScrollRef is true) ──
  useEffect(() => {
    if (autoScrollRef.current && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // ── Timestamp formatter (cached per render, not per event) ──
  const getTimestamp = useCallback(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0').slice(0, 2)}`;
  }, []);

  // ── Main effect: start import + listen to batched events ──
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    const startImport = async () => {
      if (!hasStarted) return;
      setIsImporting(true);
      setIsDone(false);
      setIsStopped(false);

      // Listen for BATCHED progress events (new protocol)
      unlisten = await listen<ImportProgressBatch>('import-progress-batch', (event) => {
        const batch = event.payload;

        // Update aggregate stats (single setState, no per-row storm)
        setStats({
          total: batch.total,
          current: batch.current,
          success: batch.success_count,
          error: batch.error_count,
        });

        setIsPaused(batch.is_paused);

        if (batch.is_done) {
          setIsDone(true);
          setIsImporting(false);
        }
        if (batch.is_stopped) {
          setIsStopped(true);
          setIsImporting(false);
        }

        // Convert entries into LogEntry objects and buffer them
        const ts = getTimestamp();
        const newEntries: LogEntry[] = batch.entries.map(entry => ({
          id: `log-${idCounterRef.current++}`,
          name: entry.last_name,
          status: entry.status,
          message: entry.message,
          timestamp: ts,
        }));

        if (newEntries.length > 0) {
          pendingLogsRef.current.push(...newEntries);
          scheduleFlush();
        }
      });

      // Invoke the background import (returns immediately now)
      try {
        await invoke('import_school_accounts', { 
          csvPath,
          groupName: groupName 
        });
      } catch (e) {
        const ts = getTimestamp();
        pendingLogsRef.current.push({
          id: `log-${idCounterRef.current++}`,
          name: 'SYSTEM',
          status: 'error',
          message: String(e),
          timestamp: ts,
        });
        scheduleFlush();
        setIsImporting(false);
      }
    };

    startImport();

    return () => {
      if (unlisten) unlisten();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [csvPath, getTimestamp, scheduleFlush, hasStarted, groupName]);

  // ── Control handlers ──
  const handlePause = useCallback(async () => {
    try { await invoke('pause_import'); } catch (e) { console.error('Pause failed:', e); }
  }, []);

  const handleResume = useCallback(async () => {
    try { await invoke('resume_import'); } catch (e) { console.error('Resume failed:', e); }
  }, []);

  const handleStop = useCallback(async () => {
    setShowStopConfirm(false);
    try { await invoke('stop_import'); } catch (e) { console.error('Stop failed:', e); }
  }, []);

  const handleMinimize = useCallback(() => {
    if (onMinimize) onMinimize();
  }, [onMinimize]);

  // ── Derived values ──
  const progress = stats.total > 0 ? (stats.current / stats.total) * 100 : 0;
  const statusText = useMemo(() => {
    if (isStopped) return 'IMPORT STOPPED — CHANGES ROLLED BACK';
    if (isDone) return 'IMPORT COMPLETE';
    if (isPaused) return 'PAUSED';
    if (isImporting) return 'PROCESSING ACCOUNTS...';
    return 'READY';
  }, [isStopped, isDone, isPaused, isImporting]);

  const canClose = !isImporting || isDone || isStopped;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <BeveledBox variant="raised" className="w-full max-w-2xl bg-classic-grey dark:bg-dark-surface shadow-2xl flex flex-col h-[80vh]">
        <TitleBar
          title="Import School Accounts - Real-time Logs"
          onClose={canClose ? onClose : undefined}
        />

        <div className="p-4 flex flex-col flex-1 overflow-hidden space-y-3">
          {!hasStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-2">
                <BeveledBox variant="sunken" className="p-4 bg-blue-50 dark:bg-blue-900/10 max-w-md">
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    IMPORT CONFIGURATION
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Please verify the CSV format and select the target group for this import.
                  </p>
                </BeveledBox>
              </div>

              <div className="w-64 space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Target Account Group</label>
                <select 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value as any)}
                  className="w-full h-10 px-3 bg-white dark:bg-black border-2 border-gray-400 dark:border-dark-border-light
                    font-bold text-sm focus:outline-none focus:border-blue-500 shadow-inner"
                >
                  <option value="STUDENT">STUDENT (Default)</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMINISTRATOR</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setHasStarted(true)}
                  className="px-10 py-3 bg-blue-700 text-white font-bold uppercase text-sm
                    border-2 border-t-blue-400 border-l-blue-400 border-b-blue-900 border-r-blue-900
                    hover:bg-blue-600 active:shadow-bevel-sunken transition-all shadow-lg"
                >
                  Start Import Now
                </button>
                <button
                  onClick={onClose}
                  className="px-10 py-3 bg-gray-300 text-gray-700 font-bold uppercase text-sm
                    border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600
                    hover:bg-gray-200 active:shadow-bevel-sunken transition-all shadow-lg"
                >
                  Cancel
                </button>
              </div>

              <div className="text-[10px] text-gray-400 flex items-center gap-2">
                <FilePlus size={10} />
                <span>File: {csvPath.split(/[\\/]/).pop()}</span>
              </div>
            </div>
          ) : (
            <>
              {/* ── Stats Bar ── */}
          <div className="grid grid-cols-3 gap-2">
            <BeveledBox variant="sunken" className="p-3 bg-white dark:bg-black/20 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-gray-500">Processed</span>
              <span className="text-xl font-black font-mono">{stats.current} / {stats.total}</span>
            </BeveledBox>
            <BeveledBox variant="sunken" className="p-3 bg-green-50 dark:bg-green-900/20 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-green-600">Success</span>
              <span className="text-xl font-black font-mono text-green-700 dark:text-green-400">{stats.success}</span>
            </BeveledBox>
            <BeveledBox variant="sunken" className="p-3 bg-red-50 dark:bg-red-900/20 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-red-600">Errors</span>
              <span className="text-xl font-black font-mono text-red-700 dark:text-red-400">{stats.error}</span>
            </BeveledBox>
          </div>

          {/* ── Progress Bar ── */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
              <span>Import Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-[#808080] dark:bg-black/40 border-2 border-white dark:border-dark-highlight shadow-inner relative overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ease-out shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)] ${
                  isStopped
                    ? 'bg-red-600'
                    : isPaused
                      ? 'bg-amber-500'
                      : 'bg-blue-700 dark:bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white mix-blend-difference">
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          {/* ── Control Buttons ── */}
          {isImporting && !isDone && !isStopped && (
            <div className="flex gap-2">
              {/* Pause / Resume */}
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase
                    bg-green-600 hover:bg-green-500 text-white border-2
                    border-t-green-400 border-l-green-400 border-b-green-800 border-r-green-800
                    active:shadow-bevel-sunken transition-all"
                  title="Resume Import"
                >
                  <Play size={12} /> Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase
                    bg-amber-500 hover:bg-amber-400 text-white border-2
                    border-t-amber-300 border-l-amber-300 border-b-amber-700 border-r-amber-700
                    active:shadow-bevel-sunken transition-all"
                  title="Pause Import"
                >
                  <Pause size={12} /> Pause
                </button>
              )}

              {/* Stop */}
              {!showStopConfirm ? (
                <button
                  onClick={() => setShowStopConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase
                    bg-red-600 hover:bg-red-500 text-white border-2
                    border-t-red-400 border-l-red-400 border-b-red-800 border-r-red-800
                    active:shadow-bevel-sunken transition-all"
                  title="Stop Import"
                >
                  <Square size={12} /> Stop
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-red-900/20 dark:bg-red-950/40 px-3 py-1.5 border border-red-500/30">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <span className="text-[10px] text-red-300 font-bold uppercase">Stop & rollback all changes?</span>
                  <button
                    onClick={handleStop}
                    className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white border border-red-400 hover:bg-red-500"
                  >
                    YES
                  </button>
                  <button
                    onClick={() => setShowStopConfirm(false)}
                    className="px-2 py-0.5 text-[10px] font-bold bg-gray-600 text-white border border-gray-400 hover:bg-gray-500"
                  >
                    NO
                  </button>
                </div>
              )}

              {/* Minimize / Background */}
              {onMinimize && (
                <button
                  onClick={handleMinimize}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase ml-auto
                    bg-classic-grey dark:bg-dark-panel text-black dark:text-blue-100 border-2
                    border-t-white border-l-white border-b-gray-600 border-r-gray-600
                    dark:border-t-dark-highlight dark:border-l-dark-highlight dark:border-b-dark-border-dark dark:border-r-dark-border-dark
                    hover:bg-gray-200 dark:hover:bg-dark-highlight active:shadow-bevel-sunken transition-all"
                  title="Minimize to background — import continues running"
                >
                  <Minimize2 size={12} /> Background
                </button>
              )}
            </div>
          )}

          {/* ── Logs Terminal ── */}
          <BeveledBox variant="sunken" className="flex-1 bg-black text-[#00FF00] font-mono text-xs overflow-hidden flex flex-col border-2 border-gray-600">
            <div className="p-2 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Activity size={10} className={isImporting && !isPaused ? 'animate-pulse' : ''} />
                {isPaused ? 'Stream Paused' : 'Live Activity Stream'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-mono">{logs.length} entries</span>
                {isImporting && !isPaused && <Loader2 size={12} className="animate-spin text-blue-400" />}
                {isPaused && <Pause size={12} className="text-amber-400" />}
              </div>
            </div>
            <div
              ref={logContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-2 custom-scrollbar"
              style={{ willChange: 'transform' }}
            >
              {logs.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-600 italic">
                  Waiting for data stream...
                </div>
              )}
              {logs.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </div>
          </BeveledBox>

          {/* ── Footer ── */}
          <div className="flex justify-between items-center pt-1">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-[10px]">
              {isStopped && (
                <span className="text-red-500 font-bold uppercase flex items-center gap-1">
                  <AlertTriangle size={10} /> Stopped — all changes were rolled back
                </span>
              )}
              {isDone && (
                <span className="text-green-500 font-bold uppercase">
                  ✔ Import completed successfully
                </span>
              )}
              {isPaused && isImporting && (
                <span className="text-amber-400 font-bold uppercase animate-pulse">
                  ❚❚ Paused — click Resume to continue
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              disabled={isImporting && !isDone && !isStopped}
              className={`px-8 py-2 font-bold uppercase text-sm border-2 shadow-bevel-raised active:shadow-bevel-sunken transition-all
                ${isImporting && !isDone && !isStopped
                  ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                  : 'bg-classic-grey dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-highlight border-white dark:border-dark-highlight text-black dark:text-blue-100'
                }`}
            >
              {isDone || isStopped ? 'Close' : isImporting ? 'Importing...' : 'Cancel'}
            </button>
          </div>
            </>
          )}
        </div>
      </BeveledBox>
    </div>
  );
};

// ─── Inline Activity SVG icon ───────────────────────────────────────────────

const Activity = ({ size, className }: { size: number; className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);
