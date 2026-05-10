import React, { useState, useEffect } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { DocumentPreviewWorkspace } from '../../document-preview/DocumentPreviewWorkspace';
import { useReportPreview } from '../../../hooks/useReportPreview';
import { ACCOUNT_COLUMNS } from './accountColumns';
import { generateDocumentPDF } from '../../../utils/documentReportGenerator';
import { MessageDialog } from '../../common/MessageDialog';
import { Patron } from '../../../stores/patronStore';
import { invoke } from '@tauri-apps/api/core';

interface AccountPreviewAdapterProps {
  onClose: () => void;
  filter?: string;
}

export const AccountPreviewAdapter: React.FC<AccountPreviewAdapterProps> = ({ 
  onClose,
  filter = ''
}) => {
  const [data, setData] = useState<Patron[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let patrons;
        if (filter.trim()) {
          patrons = await invoke<Patron[]>('search_patrons', { query: filter, offset: 0 });
        } else {
          patrons = await invoke<Patron[]>('get_patrons', { offset: 0 });
        }
        setData(patrons);
      } catch (error) {
        console.error('Failed to fetch account preview data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const previewState = useReportPreview({
    columns: ACCOUNT_COLUMNS,
    data: data,
    defaultTitle: 'infoLib School Accounts Report',
  });

  const handleExportPDF = async () => {
    try {
      const path = await save({
        filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
        defaultPath: `school_accounts_report_${new Date().getTime()}.pdf`,
      });

      if (!path) return;

      const pdfBuffer = await generateDocumentPDF(data, {
        title: previewState.reportTitle,
        subtitle: filter ? `Filter: "${filter}"` : 'Complete Student & Faculty Directory',
        columns: ACCOUNT_COLUMNS,
        visibleColumns: previewState.visibleColumns,
        orientation: previewState.orientation,
        paperSize: previewState.paperSize,
        fontSize: previewState.fontSize,
        stats: [
          `Total Accounts: ${data.length}`,
          `Total Unpaid Fines: ${data.reduce((acc, p) => acc + p.unpaid_fine, 0).toFixed(2)}`
        ]
      });

      await writeFile(path, new Uint8Array(pdfBuffer));
      setExportMessage({
        title: 'Export Successful',
        message: 'School accounts report saved successfully!',
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-classic-grey p-8 border-2 border-white shadow-bevel-raised flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent animate-spin rounded-full" />
          <p className="font-bold text-blue-900">Gathering Account Data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DocumentPreviewWorkspace
        title="School Accounts Report Preview"
        columns={ACCOUNT_COLUMNS}
        data={data}
        previewState={previewState}
        onExportPDF={handleExportPDF}
        onPrint={() => window.print()}
        onClose={onClose}
        statsRenderer={() => (
          <div className="space-y-2">
            <div className="p-2 bg-white dark:bg-black/20 border border-gray-400">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Total Accounts</p>
              <p className="text-xl font-black">{data.length}</p>
            </div>
            <div className="p-2 bg-white dark:bg-black/20 border border-gray-400">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Total Fines</p>
              <p className="text-xl font-black text-red-600">
                {data.reduce((acc, p) => acc + p.unpaid_fine, 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
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
