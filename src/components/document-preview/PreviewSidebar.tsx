/**
 * PreviewSidebar — Right panel for the Document Preview workspace.
 * Contains page navigation thumbnails, document settings, and quick stats.
 * Win95/98 aesthetic with sunken section dividers.
 */

import React from 'react';
import { 
  Settings2, 
  Navigation, 
  BarChart3,
  Type,
  Layout
} from 'lucide-react';
import type { ReportPreviewState } from './types';
import { PageThumbnail } from './PageThumbnail';

interface PreviewSidebarProps {
  previewState: ReportPreviewState;
  statsRenderer?: () => React.ReactNode;
}

export const PreviewSidebar: React.FC<PreviewSidebarProps> = ({
  previewState,
  statsRenderer,
}) => {
  const {
    totalPages,
    currentPage,
    goToPage,
    paperSize,
    orientation,
    reportTitle,
    setReportTitle,
    showHeader,
    setShowHeader,
    showFooter,
    setShowFooter,
    fontSize,
    setFontSize,
    tableDensity,
    setTableDensity,
  } = previewState;

  return (
    <div className="w-[220px] flex flex-col h-full bg-classic-grey dark:bg-dark-panel border-l border-gray-400 dark:border-gray-800 overflow-hidden no-print">
      
      {/* ── Page Navigator ── */}
      <SidebarSection title="Page Navigator" icon={<Navigation size={12} />}>
        <div className="flex flex-col gap-4 py-2 items-center">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <PageThumbnail 
              key={idx}
              pageNumber={idx + 1}
              isActive={currentPage === idx + 1}
              onClick={() => goToPage(idx + 1)}
              paperSize={paperSize}
              orientation={orientation}
            />
          ))}
        </div>
      </SidebarSection>

      {/* ── Document Settings ── */}
      <SidebarSection title="Document Settings" icon={<Settings2 size={12} />}>
        <div className="space-y-3 p-1">
          <div>
            <Label>Report Title</Label>
            <input 
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full bg-white dark:bg-black/20 border-2 border-gray-400 dark:border-gray-700 p-1 text-[10px] outline-none"
            />
          </div>

          <div className="space-y-1">
            <ToggleButton 
              label="Show Header" 
              active={showHeader} 
              onClick={() => setShowHeader(!showHeader)} 
            />
            <ToggleButton 
              label="Show Footer" 
              active={showFooter} 
              onClick={() => setShowFooter(!showFooter)} 
            />
          </div>

          <div>
            <Label icon={<Type size={10} />}>Font Size</Label>
            <div className="grid grid-cols-3 gap-1">
              {['small', 'medium', 'large'].map((size) => (
                <RadioTab 
                  key={size}
                  active={fontSize === size}
                  onClick={() => setFontSize(size as any)}
                  label={size}
                />
              ))}
            </div>
          </div>

          <div>
            <Label icon={<Layout size={10} />}>Density</Label>
            <div className="grid grid-cols-3 gap-1">
              {['compact', 'normal', 'relaxed'].map((d) => (
                <RadioTab 
                  key={d}
                  active={tableDensity === d}
                  onClick={() => setTableDensity(d as any)}
                  label={d}
                />
              ))}
            </div>
          </div>
        </div>
      </SidebarSection>

      {/* ── Quick Stats ── */}
      <SidebarSection title="Quick Stats" icon={<BarChart3 size={12} />} className="mt-auto border-t-2 border-gray-400 dark:border-gray-700">
        {statsRenderer ? statsRenderer() : (
          <div className="p-1 space-y-1">
            <StatItem label="Total Pages" value={totalPages} />
            <StatItem label="Current Page" value={currentPage} />
          </div>
        )}
      </SidebarSection>

    </div>
  );
};

// ── Internal Helper Components ──

const SidebarSection: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className }) => (
  <div className={`flex flex-col min-h-0 ${className}`}>
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-300 dark:bg-black/30 border-b border-gray-400 dark:border-gray-700">
      <span className="text-gray-600 dark:text-gray-400">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">{title}</span>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
      {children}
    </div>
  </div>
);

const Label: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ children, icon }) => (
  <div className="flex items-center gap-1 mb-1">
    {icon && <span className="text-gray-500">{icon}</span>}
    <span className="text-[9px] font-bold uppercase text-gray-500 dark:text-gray-400">{children}</span>
  </div>
);

const ToggleButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-2 cursor-pointer group select-none"
  >
    <div className={`
      w-3.5 h-3.5 border-2 flex items-center justify-center
      ${active ? 'border-[#000080] bg-white' : 'border-gray-400 bg-gray-100'}
    `}>
      {active && <div className="w-2 h-2 bg-[#000080]" />}
    </div>
    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{label}</span>
  </div>
);

const RadioTab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      py-1 text-[8px] font-bold uppercase tracking-tight border shadow-bevel-raised active:shadow-bevel-sunken
      ${active ? 'bg-[#000080] text-white border-blue-400' : 'bg-gray-200 dark:bg-dark-highlight text-gray-600 dark:text-gray-300 border-white dark:border-gray-700'}
    `}
  >
    {label}
  </button>
);

const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-0.5 border-b border-gray-200 dark:border-white/5">
    <span className="text-[9px] font-medium text-gray-500">{label}</span>
    <span className="text-[10px] font-black text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);
