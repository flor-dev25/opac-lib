/**
 * DocumentPreviewWorkspace — The main shell for the reusable Document Preview system.
 * Generic component: assembles all preview parts into a 3-panel professional workspace.
 * Features a Win95/98 aesthetic status bar at the bottom.
 */

import React from 'react';
import type { DocumentPreviewWorkspaceProps } from './types';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewSidebar } from './PreviewSidebar';
import { PreviewCanvas } from './PreviewCanvas';
import { ColumnVisibilityPanel } from './ColumnVisibilityPanel';
import { BeveledBox } from '../common/BeveledBox';
import { TitleBar } from '../layout/TitleBar';

export function DocumentPreviewWorkspace<T>({
  title,
  columns,
  data,
  previewState,
  onExportPDF,
  onPrint,
  onClose,
  statsRenderer,
}: DocumentPreviewWorkspaceProps<T>) {
  const {
    currentPage,
    totalPages,
    zoom,
    visibleColumns,
    toggleColumn,
    paginatedPages
  } = previewState;

  // Use the export handler provided by props but wrap it in the preview state action if needed
  // In this generic shell, we just use the props
  const handleExport = async () => {
    await onExportPDF();
  };

  const handlePrint = () => {
    onPrint();
  };

  return (
    <div className="fixed inset-0 z-[320] flex flex-col bg-black/60 backdrop-blur-md overflow-hidden">
      {/* ── Main Container ── */}
      <BeveledBox 
        variant="raised" 
        padding="p-0"
        className="flex-1 flex flex-col bg-classic-grey dark:bg-dark-surface shadow-2xl overflow-hidden border-2 border-white dark:border-dark-highlight"
      >
        {/* Title Bar */}
        <TitleBar title={title} onClose={onClose} hideUserProfile={true} />

        {/* Top Toolbar */}
        <PreviewToolbar 
          previewState={{
            ...previewState,
            exportPDF: handleExport,
            print: handlePrint
          }} 
          onClose={onClose} 
        />

        {/* ── Three Panel Content Area ── */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Column Visibility */}
          <div className="w-[200px] flex-shrink-0 border-r border-gray-400 dark:border-gray-800">
            <ColumnVisibilityPanel 
              columns={columns}
              visibleColumns={visibleColumns}
              onToggle={toggleColumn}
            />
          </div>

          {/* Central Panel: Document Canvas */}
          <div className="flex-1 relative flex flex-col overflow-hidden bg-[#808080] dark:bg-[#2A2A2A]">
            <PreviewCanvas 
              pages={paginatedPages}
              columns={columns}
              previewState={previewState}
            />
          </div>

          {/* Right Panel: Navigator & Settings */}
          <PreviewSidebar 
            previewState={previewState}
            statsRenderer={statsRenderer}
          />

        </div>

        {/* ── Win95 Status Bar ── */}
        <div className="h-6 bg-classic-grey dark:bg-dark-panel border-t border-gray-400 dark:border-gray-800 flex items-center gap-1 px-1 no-print">
          <StatusBarField className="flex-1">
            Status: <span className="font-bold text-blue-800 dark:text-blue-400">Ready</span>
          </StatusBarField>
          <StatusBarField width="w-32">
            Page {currentPage} of {totalPages}
          </StatusBarField>
          <StatusBarField width="w-32">
            {data.length} Records
          </StatusBarField>
          <StatusBarField width="w-24">
            Zoom: {Math.round(zoom * 100)}%
          </StatusBarField>
        </div>
      </BeveledBox>
    </div>
  );
}

// ── Internal Helper Component ──

const StatusBarField: React.FC<{ 
  children: React.ReactNode; 
  width?: string;
  className?: string;
}> = ({ children, width = '', className = '' }) => (
  <div className={`
    h-4 px-2 border-2 border-white dark:border-gray-700 shadow-bevel-sunken 
    text-[9px] font-medium flex items-center bg-gray-200 dark:bg-black/20 
    ${width} ${className}
  `}>
    {children}
  </div>
);
