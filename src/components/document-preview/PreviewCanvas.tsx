/**
 * PreviewCanvas — Central document renderer for the Document Preview system.
 * Generic component: renders any tabular data using HTML/CSS.
 * Mirroring the layout that jsPDF produces for WYSIWYG parity.
 */

import { useMemo } from 'react';
import type { ColumnDefinition, ReportPreviewState } from './types';
import { 
  mmToPx, 
  ptToPx, 
  getPaperDimensionsPx, 
  DEFAULT_MARGINS,
  FONT_SIZES,
  TABLE_DENSITY_ROW_HEIGHT,
  HEADER_HEIGHT_MM,
  FOOTER_HEIGHT_MM,
  TABLE_HEADER_HEIGHT_MM
} from '../../utils/reportConfig';
import { getColumnWidthPercentages } from '../../utils/reportPagination';

interface PreviewCanvasProps<T> {
  /** Generic data split into pages */
  pages: T[][];
  /** Column definitions */
  columns: ColumnDefinition<T>[];
  /** Current preview state (zoom, settings, etc.) */
  previewState: ReportPreviewState;
}

export function PreviewCanvas<T>({
  pages,
  columns,
  previewState,
}: PreviewCanvasProps<T>) {
  const { 
    zoom, 
    orientation, 
    paperSize, 
    fontSize, 
    tableDensity, 
    reportTitle, 
    showHeader, 
    showFooter,
    visibleColumns 
  } = previewState;

  // ── Dimensions ──
  const paperDim = getPaperDimensionsPx(paperSize, orientation);
  const marginPx = {
    top: mmToPx(DEFAULT_MARGINS.top),
    right: mmToPx(DEFAULT_MARGINS.right),
    bottom: mmToPx(DEFAULT_MARGINS.bottom),
    left: mmToPx(DEFAULT_MARGINS.left),
  };

  const fontSet = FONT_SIZES[fontSize];
  const rowHeightPx = mmToPx(TABLE_DENSITY_ROW_HEIGHT[tableDensity]);
  const tableHeaderHeightPx = mmToPx(TABLE_HEADER_HEIGHT_MM);

  // ── Column Widths ──
  const columnWidths = useMemo(
    () => getColumnWidthPercentages(columns, visibleColumns),
    [columns, visibleColumns]
  );

  const filteredColumns = useMemo(
    () => columns.filter(col => visibleColumns.includes(col.key)),
    [columns, visibleColumns]
  );

  return (
    <div className="flex-1 overflow-auto bg-[#808080] dark:bg-[#2A2A2A] flex flex-col items-center p-8 custom-scrollbar">
      <div 
        className="flex flex-col gap-8 origin-top transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        {pages.map((pageData, pageIdx) => (
          <div 
            key={pageIdx}
            id={`report-page-${pageIdx + 1}`}
            className="bg-white shadow-2xl relative flex flex-col text-black selection:bg-blue-200"
            style={{ 
              width: paperDim.width, 
              height: paperDim.height,
              padding: `${marginPx.top}px ${marginPx.right}px ${marginPx.bottom}px ${marginPx.left}px`
            }}
          >
            {/* ── Page Content Wrapper (to handle flex-1 table) ── */}
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* ── Header (Only on first page or if explicitly enabled per page) ── */}
              {showHeader && pageIdx === 0 && (
                <div style={{ height: mmToPx(HEADER_HEIGHT_MM), marginBottom: '4mm' }}>
                  <div className="flex justify-between items-start border-b-2 border-[#000080] pb-2">
                    <div>
                      <h1 style={{ fontSize: ptToPx(fontSet.header), fontWeight: 900, color: '#000080' }} className="m-0 leading-none">
                        {reportTitle}
                      </h1>
                      <p style={{ fontSize: ptToPx(fontSet.subheader), color: '#666' }} className="mt-1 font-bold">
                        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    {/* Placeholder for Logo */}
                    <div className="w-12 h-12 bg-[#000080] flex items-center justify-center text-white font-black text-xl italic">
                      iL
                    </div>
                  </div>
                  
                  {/* Stats summary - placeholder for domain stats */}
                  <div className="flex gap-4 mt-2" style={{ fontSize: ptToPx(fontSet.table) }}>
                    <span className="font-bold">Total Records: <span className="text-blue-800">{pages.flat().length}</span></span>
                    <span className="font-bold">Pages: <span className="text-blue-800">{pages.length}</span></span>
                  </div>
                </div>
              )}

              {/* ── Table ── */}
              <div className="flex-1 flex flex-col">
                <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ height: tableHeaderHeightPx, backgroundColor: '#000080', color: 'white' }}>
                      {filteredColumns.map(col => (
                        <th 
                          key={col.key}
                          className="px-2 text-left font-bold"
                          style={{ 
                            width: columnWidths.get(col.key), 
                            fontSize: ptToPx(fontSet.table),
                            textAlign: col.align || 'left'
                          }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((row, rowIdx) => (
                      <tr 
                        key={rowIdx} 
                        style={{ 
                          height: rowHeightPx, 
                          backgroundColor: rowIdx % 2 === 1 ? '#f5f5f5' : 'transparent',
                          borderBottom: '0.1mm solid #ddd'
                        }}
                      >
                        {filteredColumns.map(col => (
                          <td 
                            key={col.key}
                            className="px-2 truncate"
                            style={{ 
                              fontSize: ptToPx(fontSet.table),
                              textAlign: col.align || 'left'
                            }}
                          >
                            {col.accessor(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Footer ── */}
              {showFooter && (
                <div 
                  className="mt-auto border-t border-gray-300 pt-2 flex justify-between items-center"
                  style={{ height: mmToPx(FOOTER_HEIGHT_MM), fontSize: ptToPx(fontSet.footer), color: '#888' }}
                >
                  <div className="font-bold uppercase tracking-wider">infoLib v1.0 — Security & Management System</div>
                  <div className="font-bold">Page {pageIdx + 1} of {pages.length}</div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
