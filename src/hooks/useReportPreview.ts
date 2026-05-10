/**
 * useReportPreview — Generic preview state management hook.
 * Data-agnostic: manages layout/display state only.
 * Data fetching is the adapter's responsibility.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  Orientation,
  PaperSize,
  FontSize,
  TableDensity,
  ColumnDefinition,
  ReportPreviewState,
} from '../components/document-preview/types';
import { paginateData } from '../utils/reportPagination';
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '../utils/reportConfig';

export interface UseReportPreviewOptions<T> {
  /** Column definitions (used for default visible columns) */
  columns: ColumnDefinition<T>[];
  /** Raw data rows — passed in by the adapter */
  data: T[];
  /** Default report title */
  defaultTitle?: string;
  /** Default orientation */
  defaultOrientation?: Orientation;
  /** Default paper size */
  defaultPaperSize?: PaperSize;
}

export function useReportPreview<T>(options: UseReportPreviewOptions<T>): ReportPreviewState<T> {
  const {
    columns,
    data,
    defaultTitle = 'infoLib Report',
    defaultOrientation = 'portrait',
    defaultPaperSize = 'a4',
  } = options;

  // ── Page Setup ──
  const [orientation, setOrientation] = useState<Orientation>(defaultOrientation);
  const [paperSize, setPaperSize] = useState<PaperSize>(defaultPaperSize);

  // ── Column Visibility ──
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    () => columns.filter(c => c.defaultVisible).map(c => c.key)
  );

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns(prev => {
      const isVisible = prev.includes(key);
      // Prevent hiding the last visible column
      if (isVisible && prev.length <= 1) return prev;
      return isVisible
        ? prev.filter(k => k !== key)
        : [...prev, key];
    });
  }, []);

  // ── Preview Settings ──
  const [zoom, setZoomRaw] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportTitle, setReportTitle] = useState(defaultTitle);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [tableDensity, setTableDensity] = useState<TableDensity>('normal');

  // ── Pagination (memoized) ──
  const paginationResult = useMemo(
    () => paginateData(data, {
      paperSize,
      orientation,
      fontSize,
      tableDensity,
      showHeader,
      showFooter,
    }),
    [data, paperSize, orientation, fontSize, tableDensity, showHeader, showFooter]
  );

  const totalPages = paginationResult.totalPages;

  // ── Zoom Actions ──
  const setZoom = useCallback((z: number) => {
    setZoomRaw(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)));
  }, []);

  const zoomIn = useCallback(() => {
    setZoomRaw(prev => Math.min(ZOOM_MAX, Math.round((prev + ZOOM_STEP) * 100) / 100));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomRaw(prev => Math.max(ZOOM_MIN, Math.round((prev - ZOOM_STEP) * 100) / 100));
  }, []);

  // fitWidth and fitPage are no-ops for now — need canvas container ref
  const fitWidth = useCallback(() => setZoomRaw(1.0), []);
  const fitPage = useCallback(() => setZoomRaw(0.75), []);

  // ── Page Navigation ──
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(totalPages, Math.max(1, page)));
  }, [totalPages]);

  // ── Export / Print (stubs — wired by adapter) ──
  const exportPDF = useCallback(async () => {
    // Adapter provides the real implementation
    console.warn('exportPDF not wired — provide via adapter');
  }, []);

  const print = useCallback(() => {
    window.print();
  }, []);

  return {
    // State
    orientation,
    paperSize,
    visibleColumns,
    zoom,
    currentPage,
    totalPages,
    reportTitle,
    showHeader,
    showFooter,
    fontSize,
    tableDensity,

    // Actions
    setOrientation,
    setPaperSize,
    toggleColumn,
    setZoom,
    zoomIn,
    zoomOut,
    fitWidth,
    fitPage,
    goToPage,
    setReportTitle,
    setShowHeader,
    setShowFooter,
    setFontSize,
    setTableDensity,
    exportPDF,
    print,

    // Derived
    paginatedPages: paginationResult.pages,
  };
}
