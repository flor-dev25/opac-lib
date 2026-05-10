/**
 * PreviewToolbar — Top action bar for the Document Preview workspace.
 * Controls zoom, orientation, paper size, and export actions.
 * Win95/98 aesthetic with beveled buttons.
 */

import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  FileDown, 
  Printer, 
  X, 
  Maximize2,
  Columns
} from 'lucide-react';
import type { PaperSize, ReportPreviewState } from './types';
import { BeveledBox } from '../common/BeveledBox';
import { ZOOM_PRESETS } from '../../utils/reportConfig';

interface PreviewToolbarProps {
  previewState: ReportPreviewState;
  onClose: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  previewState,
  onClose,
}) => {
  const {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    orientation,
    setOrientation,
    paperSize,
    setPaperSize,
    exportPDF,
    print,
    fitWidth,
    fitPage
  } = previewState;

  return (
    <BeveledBox 
      variant="raised" 
      padding="p-1"
      className="bg-classic-grey dark:bg-dark-surface border-b border-gray-400 dark:border-gray-800 flex items-center gap-2 h-10 px-2 z-50 no-print"
    >
      {/* ── Zoom Controls ── */}
      <div className="flex items-center gap-1 mr-2 border-r border-gray-400 dark:border-gray-700 pr-2">
        <ToolbarButton onClick={zoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </ToolbarButton>
        
        <select 
          value={zoom} 
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="bg-white dark:bg-black/20 border border-gray-400 dark:border-gray-700 text-[10px] h-6 px-1 outline-none"
        >
          {ZOOM_PRESETS.map(z => (
            <option key={z} value={z}>{Math.round(z * 100)}%</option>
          ))}
          {!ZOOM_PRESETS.includes(zoom as any) && (
             <option value={zoom}>{Math.round(zoom * 100)}%</option>
          )}
        </select>

        <ToolbarButton onClick={zoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </ToolbarButton>

        <ToolbarButton onClick={fitWidth} title="Fit to Width">
          <Columns size={16} />
        </ToolbarButton>

        <ToolbarButton onClick={fitPage} title="Fit to Page">
          <Maximize2 size={16} />
        </ToolbarButton>
      </div>

      {/* ── Layout Controls ── */}
      <div className="flex items-center gap-1 mr-2 border-r border-gray-400 dark:border-gray-700 pr-2">
        <div className="flex bg-gray-200 dark:bg-black/20 p-0.5 border border-gray-400 dark:border-gray-700">
          <LayoutToggleButton 
            active={orientation === 'portrait'} 
            onClick={() => setOrientation('portrait')}
            label="Portrait"
          />
          <LayoutToggleButton 
            active={orientation === 'landscape'} 
            onClick={() => setOrientation('landscape')}
            label="Landscape"
          />
        </div>

        <select 
          value={paperSize} 
          onChange={(e) => setPaperSize(e.target.value as PaperSize)}
          className="bg-white dark:bg-black/20 border border-gray-400 dark:border-gray-700 text-[10px] h-6 px-1 outline-none ml-1"
        >
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
          <option value="legal">Legal</option>
        </select>
      </div>

      {/* ── Action Controls ── */}
      <div className="flex items-center gap-2 flex-1">
        <ActionButton onClick={exportPDF} variant="primary">
          <FileDown size={14} />
          <span>Export PDF</span>
        </ActionButton>
        <ActionButton onClick={print}>
          <Printer size={14} />
          <span>Print</span>
        </ActionButton>
      </div>

      {/* ── Close Control ── */}
      <ToolbarButton onClick={onClose} title="Close Preview" className="hover:bg-red-500 hover:text-white transition-colors">
        <X size={18} />
      </ToolbarButton>
    </BeveledBox>
  );
};

// ── Internal Helper Components ──

const ToolbarButton: React.FC<{ 
  children: React.ReactNode; 
  onClick: () => void; 
  title?: string;
  className?: string;
}> = ({ children, onClick, title, className }) => (
  <button 
    onClick={onClick}
    title={title}
    className={`p-1 hover:bg-gray-200 dark:hover:bg-white/10 active:bg-gray-300 dark:active:bg-white/20 flex items-center justify-center ${className}`}
  >
    {children}
  </button>
);

const LayoutToggleButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  label: string;
}> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`
      px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight transition-colors
      ${active 
        ? 'bg-[#000080] text-white' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/5'}
    `}
  >
    {label}
  </button>
);

const ActionButton: React.FC<{ 
  children: React.ReactNode; 
  onClick: () => void;
  variant?: 'primary' | 'default';
}> = ({ children, onClick, variant = 'default' }) => (
  <button 
    onClick={onClick}
    className={`
      px-3 h-6 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide border-2
      shadow-bevel-raised active:shadow-bevel-sunken transition-all
      ${variant === 'primary' 
        ? 'bg-blue-600 text-white border-blue-400 hover:bg-blue-700' 
        : 'bg-classic-grey dark:bg-dark-highlight text-gray-800 dark:text-white border-white dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'}
    `}
  >
    {children}
  </button>
);
