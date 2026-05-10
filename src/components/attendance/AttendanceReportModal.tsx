/**
 * AttendanceReportModal — Initial setup dialog for Attendance Reports.
 * Replaces the old blind-export modal with a step-wise setup flow.
 * User selects filters, orientation, and paper size before entering the preview workspace.
 */

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Layout, Maximize2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { format, subDays } from 'date-fns';
import { BeveledBox } from '../common/BeveledBox';
import { TitleBar } from '../layout/TitleBar';
import { AttendancePreviewAdapter } from './report-preview/AttendancePreviewAdapter';

// Import shared types from the document preview system
import { Orientation as PreviewOrientation, PaperSize as PreviewPaperSize } from '../document-preview/types';

interface AttendanceReportModalProps {
  onClose: () => void;
}

export const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({ onClose }) => {
  // ── Setup State ──
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [terminalId, setTerminalId] = useState<string>('all');
  const [terminals, setTerminals] = useState<string[]>([]);
  
  const [orientation, setOrientation] = useState<PreviewOrientation>('portrait');
  const [paperSize, setPaperSize] = useState<PreviewPaperSize>('a4');
  
  const [showPreview, setShowPreview] = useState(false);

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

  if (showPreview) {
    return (
      <AttendancePreviewAdapter 
        startDate={startDate}
        endDate={endDate}
        terminalId={terminalId}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[310] p-4 backdrop-blur-sm">
      <BeveledBox variant="raised" className="bg-[#D4D0C8] dark:bg-dark-surface w-full max-w-md shadow-2xl">
        <TitleBar title="Report Setup" onClose={onClose} hideUserProfile={true} />

        <div className="p-4 space-y-5">
          
          {/* ── Section: Data Filters ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-400 dark:border-gray-700 pb-1">
              <Calendar size={14} className="text-blue-800 dark:text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-tight">Report Period & Terminal</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase text-gray-500 font-bold block mb-1">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border-2 border-gray-400 dark:border-gray-700 p-1 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase text-gray-500 font-bold block mb-1">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border-2 border-gray-400 dark:border-gray-700 p-1 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {['Today', '7 Days', '30 Days'].map((label, idx) => {
                const days = [0, 7, 30][idx];
                return (
                  <button 
                    key={label}
                    onClick={() => setPreset(days)} 
                    className="text-[9px] font-bold uppercase bg-[#D4D0C8] dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken px-2 py-0.5"
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-2">
              <label className="text-[9px] uppercase text-gray-500 font-bold block mb-1">Terminal Filter:</label>
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

          {/* ── Section: Page Layout ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-400 dark:border-gray-700 pb-1">
              <Layout size={14} className="text-blue-800 dark:text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-tight">Document Layout</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase text-gray-500 font-bold block mb-1">Orientation:</label>
                <div className="flex border-2 border-gray-400 dark:border-gray-700 p-0.5 bg-gray-100 dark:bg-black/10">
                  <button 
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-1 text-[9px] font-bold uppercase ${orientation === 'portrait' ? 'bg-[#000080] text-white' : 'text-gray-500'}`}
                  >
                    Portrait
                  </button>
                  <button 
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-1 text-[9px] font-bold uppercase ${orientation === 'landscape' ? 'bg-[#000080] text-white' : 'text-gray-500'}`}
                  >
                    Landscape
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase text-gray-500 font-bold block mb-1">Paper Size:</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as PreviewPaperSize)}
                  className="w-full bg-white dark:bg-black/20 border-2 border-gray-400 dark:border-gray-700 p-1 text-sm outline-none"
                >
                  <option value="a4">A4 (Standard)</option>
                  <option value="letter">Letter (US)</option>
                  <option value="legal">Legal</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-400 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#D4D0C8] dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="px-6 py-1.5 bg-blue-600 text-white border-2 border-blue-400 shadow-bevel-raised active:shadow-bevel-sunken text-xs font-black uppercase flex items-center gap-2"
            >
              <Maximize2 size={14} />
              <span>Preview Report</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};
