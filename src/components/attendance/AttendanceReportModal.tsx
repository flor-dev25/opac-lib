import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { format, subDays } from 'date-fns';
import { generateAttendancePDF } from '../../utils/attendanceReportGenerator';
import { BeveledBox } from '../common/BeveledBox';
import { TitleBar } from '../layout/TitleBar';

interface AttendanceReportModalProps {
  onClose: () => void;
}

export const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({ onClose }) => {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [terminalId, setTerminalId] = useState<string>('all');
  const [terminals, setTerminals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTerminals();
  }, []);

  const fetchTerminals = async () => {
    try {
      const list: string[] = await invoke('get_unique_terminals');
      setTerminals(list);
    } catch (error) {
      console.error('Failed to fetch terminals:', error);
    }
  };

  const setPreset = (days: number) => {
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setStartDate(format(subDays(new Date(), days), 'yyyy-MM-dd'));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatus('loading');
    setMessage('Fetching attendance data...');

    try {
      console.log('Starting report generation for:', { startDate, endDate, terminalId });
      
      // 1. Get Save Path
      const path = await save({
        filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
        defaultPath: `attendance_report_${startDate}_to_${endDate}.pdf`,
      });

      if (!path) {
        console.log('User cancelled save dialog');
        setIsGenerating(false);
        setStatus('idle');
        return;
      }

      console.log('Target path:', path);

      // 2. Fetch Data from Backend
      const data: any[] = await invoke('get_attendance_report_data', {
        startDate,
        endDate,
        terminalId: terminalId === 'all' ? null : terminalId,
      });

      console.log('Fetched logs count:', data.length);

      if (data.length === 0) {
        setStatus('error');
        setMessage('No records found for the selected range.');
        setIsGenerating(false);
        return;
      }

      setMessage('Generating PDF layout...');
      console.log('Rendering PDF...');
      
      // 3. Generate PDF in Frontend
      const pdfBuffer = await generateAttendancePDF(data, {
        startDate,
        endDate,
        terminalId: terminalId === 'all' ? undefined : terminalId
      });

      console.log('PDF generated, buffer size:', pdfBuffer.byteLength);
      setMessage('Saving to disk...');

      // 4. Save to Disk via Tauri FS
      await writeFile(path, new Uint8Array(pdfBuffer));
      console.log('File written successfully');

      setStatus('success');
      setMessage(`Report saved successfully to ${path}`);
      setTimeout(() => onClose(), 3000);
    } catch (error: any) {
      console.error('Report Generation Error:', error);
      setStatus('error');
      setMessage(`Failed: ${error.message || error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
      <BeveledBox variant="raised" className="bg-[#D4D0C8] dark:bg-dark-surface w-full max-w-md shadow-2xl">
        <TitleBar title="Attendance Report Generator" onClose={onClose} />

        <div className="p-4 space-y-4">
          {/* Date Range Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold mb-1">
              <Calendar size={16} className="text-blue-800 dark:text-blue-400" />
              <span className="uppercase text-[10px]">Report Period</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase text-gray-500 block mb-1">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border-2 border-gray-400 dark:border-gray-700 p-1 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase text-gray-500 block mb-1">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border-2 border-gray-400 dark:border-gray-700 p-1 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setPreset(0)} className="text-[10px] bg-[#D4D0C8] dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised dark:shadow-bevel-raised-dark active:shadow-bevel-sunken dark:active:shadow-bevel-sunken-dark px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-dark-highlight">Today</button>
              <button onClick={() => setPreset(7)} className="text-[10px] bg-[#D4D0C8] dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised dark:shadow-bevel-raised-dark active:shadow-bevel-sunken dark:active:shadow-bevel-sunken-dark px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-dark-highlight">Last 7 Days</button>
              <button onClick={() => setPreset(30)} className="text-[10px] bg-[#D4D0C8] dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised dark:shadow-bevel-raised-dark active:shadow-bevel-sunken dark:active:shadow-bevel-sunken-dark px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-dark-highlight">Last 30 Days</button>
            </div>
          </div>

          {/* Filter Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold mb-1">
              <Filter size={16} className="text-blue-800 dark:text-blue-400" />
              <span className="uppercase text-[10px]">Terminal Filter</span>
            </div>
            <div>
              <select
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                className="w-full bg-white dark:bg-black/20 border-2 border-gray-400 dark:border-gray-700 p-1 text-sm outline-none"
              >
                <option value="all">All Terminals</option>
                {terminals.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <BeveledBox variant="sunken" className={`p-2 text-[10px] flex items-start gap-2 ${
              status === 'loading' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
              status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
              'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}>
              {status === 'loading' ? <Loader2 size={12} className="animate-spin shrink-0" /> :
               status === 'success' ? <CheckCircle2 size={12} className="shrink-0" /> :
               <AlertCircle size={12} className="shrink-0" />}
              <span className="font-bold">{message}</span>
            </BeveledBox>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-1 bg-[#D4D0C8] dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-1 bg-blue-600 text-white border-2 border-blue-400 shadow-bevel-raised active:shadow-bevel-sunken text-xs font-bold uppercase flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
