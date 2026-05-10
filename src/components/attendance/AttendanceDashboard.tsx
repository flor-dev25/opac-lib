import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { BeveledBox } from '../common/BeveledBox';
import { TitleBar } from '../layout/TitleBar';
import { Users, History, Activity, TrendingUp, RefreshCw, FileText } from 'lucide-react';
import { AttendanceReportModal } from './AttendanceReportModal';

interface AttendanceLog {
  idno: string;
  name: string;
  course: string;
  dte_log: string;
  reason: string;
  terminal_id: string;
}

interface AttendanceStats {
  total_today: number;
  unique_today: number;
  top_reason: string;
}

interface AttendanceDashboardProps {
  onClose: () => void;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total_today: 0,
    unique_today: 0,
    top_reason: 'Loading...',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchData = async () => {
    try {
      const [s, l] = await Promise.all([
        invoke<AttendanceStats>('get_attendance_stats'),
        invoke<AttendanceLog[]>('get_attendance_logs', { limit: 50 })
      ]);
      setStats(s);
      setLogs(l);
    } catch (e) {
      console.error('Failed to fetch attendance data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <BeveledBox variant="raised" className="w-full max-w-4xl bg-classic-grey dark:bg-dark-surface shadow-2xl flex flex-col h-[85vh]">
        <TitleBar title="Attendance System - Admin Dashboard" onClose={onClose} />

        <div className="p-4 flex flex-col flex-1 overflow-hidden space-y-4">
          {/* ── Top Stats Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BeveledBox variant="sunken" className="p-4 bg-white dark:bg-black/20 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">Total Entries (Today)</p>
                <p className="text-2xl font-black tabular-nums">{stats.total_today}</p>
              </div>
            </BeveledBox>

            <BeveledBox variant="sunken" className="p-4 bg-white dark:bg-black/20 flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full text-green-600 dark:text-green-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">Unique Students</p>
                <p className="text-2xl font-black tabular-nums">{stats.unique_today}</p>
              </div>
            </BeveledBox>

            <BeveledBox variant="sunken" className="p-4 bg-white dark:bg-black/20 flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400">
                <TrendingUp size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold uppercase text-gray-500">Top Reason</p>
                <p className="text-xl font-black truncate" title={stats.top_reason}>
                  {stats.top_reason === 'None' ? 'N/A' : stats.top_reason}
                </p>
              </div>
            </BeveledBox>
          </div>

          {/* ── Main Log Area ── */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <History size={16} className="text-gray-500" />
                <h3 className="text-xs font-bold uppercase tracking-tight text-gray-700 dark:text-gray-300">
                  Live Activity Stream
                </h3>
              </div>
              <button 
                onClick={() => { setIsLoading(true); fetchData(); }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors"
                title="Refresh logs"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <BeveledBox variant="sunken" className="flex-1 bg-white dark:bg-black/40 overflow-hidden flex flex-col">
              <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                    <tr className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-300 dark:border-gray-700">
                      <th className="px-4 py-2">Timestamp</th>
                      <th className="px-4 py-2">Student ID</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Course</th>
                      <th className="px-4 py-2">Reason</th>
                      <th className="px-4 py-2">Terminal</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium divide-y divide-gray-100 dark:divide-white/5">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">
                          No activity recorded for today yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log, idx) => (
                        <tr key={`${log.idno}-${log.dte_log}-${idx}`} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                          <td className="px-4 py-2 text-gray-500 tabular-nums">
                            {new Date(log.dte_log).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-2 font-bold">{log.idno}</td>
                          <td className="px-4 py-2 truncate max-w-[150px]" title={log.name}>{log.name}</td>
                          <td className="px-4 py-2 text-gray-500 font-bold">{log.course}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-bold uppercase tracking-tighter">
                              {log.reason}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-[10px] text-gray-400 font-mono">
                            {log.terminal_id}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </BeveledBox>
          </div>

          {/* ── Footer ── */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Real-time monitoring active
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-6 py-2 bg-blue-600 text-white border-2 border-blue-400
                  shadow-bevel-raised active:shadow-bevel-sunken font-bold uppercase text-sm
                  hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <FileText size={16} />
                Generate Report
              </button>
              <button
                onClick={onClose}
                className="px-8 py-2 bg-classic-grey dark:bg-dark-surface border-2 border-white dark:border-dark-highlight
                  shadow-bevel-raised active:shadow-bevel-sunken font-bold uppercase text-sm
                  hover:bg-gray-200 dark:hover:bg-dark-highlight transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </BeveledBox>

      {showReportModal && (
        <AttendanceReportModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};
