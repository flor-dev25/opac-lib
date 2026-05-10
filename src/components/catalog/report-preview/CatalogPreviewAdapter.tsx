import React, { useState, useEffect } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { DocumentPreviewWorkspace } from '../../document-preview/DocumentPreviewWorkspace';
import { useReportPreview } from '../../../hooks/useReportPreview';
import { CatalogRecord, CATALOG_COLUMNS } from './catalogColumns';
import { generateDocumentPDF } from '../../../utils/documentReportGenerator';
import { MessageDialog } from '../../common/MessageDialog';
import { invoke } from '@tauri-apps/api/core';

interface CatalogPreviewAdapterProps {
  onClose: () => void;
  searchQuery?: string;
  searchScope?: string;
}

export const CatalogPreviewAdapter: React.FC<CatalogPreviewAdapterProps> = ({ 
  onClose,
  searchQuery = '',
  searchScope = 'Keyword'
}) => {
  const [data, setData] = useState<CatalogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let result;
        if (searchQuery.trim()) {
          // Fetch search results (limit to first 500 for preview performance if needed, or all)
          result = await invoke<CatalogRecord[]>('search_catalog', { 
            query: searchQuery, 
            scope: searchScope, 
            offset: 0 
          });
        } else {
          // Fetch initial set
          result = await invoke<CatalogRecord[]>('get_catalog_records', { page: 1 });
        }
        setData(result);
      } catch (error) {
        console.error('Failed to fetch catalog preview data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchQuery, searchScope]);

  const previewState = useReportPreview({
    columns: CATALOG_COLUMNS,
    data: data,
    defaultTitle: 'infoLib Library Catalog Report',
  });

  const handleExportPDF = async () => {
    try {
      const path = await save({
        filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
        defaultPath: `catalog_report_${new Date().getTime()}.pdf`,
      });

      if (!path) return;

      const pdfBuffer = await generateDocumentPDF(data, {
        title: previewState.reportTitle,
        subtitle: searchQuery ? `Search: "${searchQuery}" in ${searchScope}` : 'Full Catalog Listing',
        columns: CATALOG_COLUMNS,
        visibleColumns: previewState.visibleColumns,
        orientation: previewState.orientation,
        paperSize: previewState.paperSize,
        fontSize: previewState.fontSize,
        stats: [
          `Total Items in Report: ${data.length}`
        ]
      });

      await writeFile(path, new Uint8Array(pdfBuffer));
      setExportMessage({
        title: 'Export Successful',
        message: 'Catalog report saved successfully!',
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
          <p className="font-bold text-blue-900">Preparing Catalog Report...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DocumentPreviewWorkspace
        title="Catalog Report Preview"
        columns={CATALOG_COLUMNS}
        data={data}
        previewState={previewState}
        onExportPDF={handleExportPDF}
        onPrint={() => window.print()}
        onClose={onClose}
        statsRenderer={() => (
          <div className="space-y-2">
            <div className="p-2 bg-white dark:bg-black/20 border border-gray-400">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Total Books</p>
              <p className="text-xl font-black">{data.length}</p>
            </div>
            <div className="p-2 bg-white dark:bg-black/20 border border-gray-400">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Search Scope</p>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-400">
                {searchQuery ? `"${searchQuery}"` : 'All'}
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
