/**
 * PageThumbnail — Miniature representation of a report page for the sidebar.
 * Used for quick navigation within the Document Preview system.
 */

import React from 'react';
import { getPaperDimensionsPx } from '../../utils/reportConfig';
import type { PaperSize, Orientation } from './types';

interface PageThumbnailProps {
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
  paperSize: PaperSize;
  orientation: Orientation;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  pageNumber,
  isActive,
  onClick,
  paperSize,
  orientation,
}) => {
  const paperDim = getPaperDimensionsPx(paperSize, orientation);
  const aspectRatio = paperDim.height / paperDim.width;
  const width = 140; // Fixed width for sidebar
  const height = width * aspectRatio;

  return (
    <div 
      className="flex flex-col items-center gap-1 group cursor-pointer"
      onClick={onClick}
    >
      <div 
        className={`
          relative border-2 transition-all
          ${isActive 
            ? 'border-[#000080] shadow-[0_0_8px_rgba(0,0,0,0.3)] ring-2 ring-[#000080]/20' 
            : 'border-gray-300 group-hover:border-gray-400'}
          bg-white overflow-hidden
        `}
        style={{ width, height }}
      >
        {/* Placeholder Content Visualization */}
        <div className="p-2 space-y-1 opacity-20">
          <div className="h-2 w-3/4 bg-gray-400" />
          <div className="h-1 w-1/2 bg-gray-300" />
          <div className="h-20 w-full bg-gray-100 flex flex-col gap-1 p-1">
             <div className="h-1 w-full bg-gray-300" />
             <div className="h-1 w-full bg-gray-200" />
             <div className="h-1 w-full bg-gray-200" />
             <div className="h-1 w-full bg-gray-200" />
          </div>
        </div>
        
        {/* Active Overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-[#000080]/5" />
        )}
      </div>
      <span className={`text-[10px] font-bold ${isActive ? 'text-[#000080]' : 'text-gray-500'}`}>
        PAGE {pageNumber}
      </span>
    </div>
  );
};
