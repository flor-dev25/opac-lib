/**
 * Generic pagination logic for tabular reports.
 * Calculates how many rows fit per page based on paper size,
 * font size, table density, and visible columns.
 *
 * Used by BOTH the HTML preview and jsPDF export.
 */

import type { PaperSize, FontSize, TableDensity, ColumnDefinition, PaginationResult } from '../components/document-preview/types';
import {
  PAPER_SIZES,
  DEFAULT_MARGINS,
  TABLE_DENSITY_ROW_HEIGHT,
  HEADER_HEIGHT_MM,
  FOOTER_HEIGHT_MM,
  TABLE_HEADER_HEIGHT_MM,
} from './reportConfig';

export interface PaginationOptions {
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  fontSize: FontSize;
  tableDensity: TableDensity;
  showHeader: boolean;
  showFooter: boolean;
}

/**
 * Calculate how many data rows fit on a single page.
 */
export function calculateRowsPerPage(options: PaginationOptions): number {
  const { paperSize, orientation, tableDensity, showHeader, showFooter } = options;

  const paper = PAPER_SIZES[paperSize];
  const pageHeight = orientation === 'landscape' ? paper.width : paper.height;

  // Subtract margins
  let availableHeight = pageHeight - DEFAULT_MARGINS.top - DEFAULT_MARGINS.bottom;

  // Subtract header space (first page has report header)
  if (showHeader) {
    availableHeight -= HEADER_HEIGHT_MM;
  }

  // Subtract footer space
  if (showFooter) {
    availableHeight -= FOOTER_HEIGHT_MM;
  }

  // Subtract table header row
  availableHeight -= TABLE_HEADER_HEIGHT_MM;

  // Calculate rows that fit
  const rowHeight = TABLE_DENSITY_ROW_HEIGHT[tableDensity];
  const rows = Math.floor(availableHeight / rowHeight);

  // Ensure at least 1 row per page
  return Math.max(1, rows);
}

/**
 * Calculate rows per page for continuation pages (no report header).
 */
export function calculateRowsPerContinuationPage(options: PaginationOptions): number {
  const { paperSize, orientation, tableDensity, showFooter } = options;

  const paper = PAPER_SIZES[paperSize];
  const pageHeight = orientation === 'landscape' ? paper.width : paper.height;

  let availableHeight = pageHeight - DEFAULT_MARGINS.top - DEFAULT_MARGINS.bottom;

  // Continuation pages have no report header, but keep table header
  availableHeight -= TABLE_HEADER_HEIGHT_MM;

  if (showFooter) {
    availableHeight -= FOOTER_HEIGHT_MM;
  }

  const rowHeight = TABLE_DENSITY_ROW_HEIGHT[tableDensity];
  return Math.max(1, Math.floor(availableHeight / rowHeight));
}

/**
 * Paginate data into pages based on report settings.
 * First page may hold fewer rows (due to report header).
 * Generic — works with any data type T.
 */
export function paginateData<T>(
  data: T[],
  options: PaginationOptions
): PaginationResult<T> {
  if (data.length === 0) {
    return { pages: [[]], totalPages: 1, rowsPerPage: calculateRowsPerPage(options) };
  }

  const firstPageRows = calculateRowsPerPage(options);
  const continuationRows = calculateRowsPerContinuationPage(options);

  const pages: T[][] = [];
  let offset = 0;

  // First page
  const firstPage = data.slice(0, firstPageRows);
  pages.push(firstPage);
  offset = firstPageRows;

  // Continuation pages
  while (offset < data.length) {
    const page = data.slice(offset, offset + continuationRows);
    pages.push(page);
    offset += continuationRows;
  }

  return {
    pages,
    totalPages: pages.length,
    rowsPerPage: firstPageRows,
  };
}

/**
 * Calculate the total width weight of visible columns.
 * Used to compute proportional column widths.
 */
export function calculateVisibleColumnsWidth<T>(
  columns: ColumnDefinition<T>[],
  visibleKeys: string[]
): number {
  return columns
    .filter(col => visibleKeys.includes(col.key))
    .reduce((sum, col) => sum + col.width, 0);
}

/**
 * Get column widths as percentages of the available content width.
 * Returns a map of column key → percentage string (e.g. "25%").
 */
export function getColumnWidthPercentages<T>(
  columns: ColumnDefinition<T>[],
  visibleKeys: string[]
): Map<string, string> {
  const totalWeight = calculateVisibleColumnsWidth(columns, visibleKeys);
  const widths = new Map<string, string>();

  for (const col of columns) {
    if (visibleKeys.includes(col.key)) {
      const pct = ((col.width / totalWeight) * 100).toFixed(1);
      widths.set(col.key, `${pct}%`);
    }
  }

  return widths;
}
