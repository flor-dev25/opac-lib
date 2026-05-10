/**
 * AttendancePreviewAdapter — Wires the generic DocumentPreviewWorkspace 
 * for the Attendance Report system.
 * Handles data fetching, PDF export triggers, and domain-specific stats.
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { DocumentPreviewWorkspace } from '../../document-preview/DocumentPreviewWorkspace';
import { useReportPreview } from '../../../hooks/useReportPreview';
import { AttendanceLog, ATTENDANCE_COLUMNS } from './attendanceColumns';
import { generateDocumentPDF } from '../../../utils/documentReportGenerator';
import { MessageDialog } from '../../common/MessageDialog';

interface AttendancePreviewAdapterProps {
  startDate: string;
  endDate: string;
  terminalId: string | null;
  onClose: () => void;
}

export const AttendancePreviewAdapter: React.FC<AttendancePreviewAdapterProps> = ({
  startDate,
  endDate,
  terminalId,
  onClose,
}) => {
  const [data, setData] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  // ── Data Fetching ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result: AttendanceLog[] = await invoke('get_attendance_report_data', {
          startDate,
          endDate,
          terminalId: terminalId === 'all' ? null : terminalId,
        });
        setData(result);
      } catch (error) {
        console.error('Failed to fetch attendance preview data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate, terminalId]);

  // ── Hook Setup ──
  const previewState = useReportPreview({
    columns: ATTENDANCE_COLUMNS,
    data: data,
    defaultTitle: 'infoLib Attendance Report',
  });

  // ── Export Handler ──
  const handleExportPDF = async () => {
    try {
      const path = await save({
        filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
        defaultPath: `attendance_report_${startDate}_to_${endDate}.pdf`,
      });

      if (!path) return;

      const pdfBuffer = await generateDocumentPDF(data, {
        title: previewState.reportTitle,
        subtitle: `Period: ${startDate} to ${endDate} ${terminalId ? `| Terminal: ${terminalId}` : ''}`,
        columns: ATTENDANCE_COLUMNS,
        visibleColumns: previewState.visibleColumns,
        orientation: previewState.orientation,
        paperSize: previewState.paperSize,
        fontSize: previewState.fontSize,
        stats: [
          `Total Records: ${data.length}`,
          `Unique Students: ${new Set(data.map(d => d.idno)).size}`
        ]
      });

      await writeFile(path, new Uint8Array(pdfBuffer));
      setExportMessage({
        title: 'Export Successful',
        message: 'Attendance report saved successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      setExportMessage({
        title: 'Export Failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    }
  };

  // ── Custom Stats Renderer ──
  const renderStats = () => {
    const uniqueStudents = new Set(data.map(d => d.idno)).size;
    return (
      <div className="p-1 space-y-1">
        <StatRow label="Total Logs" value={data.length} />
        <StatRow label="Unique Students" value={uniqueStudents} />
        <StatRow label="Period Start" value={startDate} />
        <StatRow label="Period End" value={endDate} />
        <StatRow label="Terminal" value={terminalId || 'All'} />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-classic-grey p-8 border-4 border-white shadow-bevel-raised flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-blue-900">Fetching Report Data...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <DocumentPreviewWorkspace
        title="Attendance Report Preview"
        columns={ATTENDANCE_COLUMNS}
        data={data}
        previewState={previewState}
        onExportPDF={handleExportPDF}
        onPrint={() => window.print()}
        onClose={onClose}
        statsRenderer={renderStats}
      />
      {exportMessage && (
        <MessageDialog 
          {...exportMessage} 
          onClose={() => setExportMessage(null)} 
        />
      )}
    </>
  );
};

const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 dark:border-white/5">
    <span className="text-[9px] font-medium text-gray-500 uppercase">{label}</span>
    <span className="text-[10px] font-black text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);
