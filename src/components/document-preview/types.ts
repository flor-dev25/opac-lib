/**
 * Generic types for the Document Preview System.
 * These types are data-agnostic and can be used for any tabular report
 * (attendance, school accounts, etc.).
 */

// ── Layout Types ──

export type Orientation = 'portrait' | 'landscape';
export type PaperSize = 'a4' | 'letter' | 'legal';
export type FontSize = 'small' | 'medium' | 'large';
export type TableDensity = 'compact' | 'normal' | 'relaxed';

// ── Column Definition (Generic) ──

/**
 * Defines a single column in the tabular report.
 * T is the row data type (e.g. AttendanceLog, SchoolAccount).
 */
export interface ColumnDefinition<T> {
  /** Unique key identifying this column */
  key: string;
  /** Display label shown in header and column visibility panel */
  label: string;
  /** Function to extract the cell value from a row */
  accessor: (row: T) => string | number;
  /** Whether this column is visible by default */
  defaultVisible: boolean;
  /** Relative width weight (e.g. 1 = narrow, 2 = normal, 3 = wide) */
  width: number;
  /** Optional text alignment override */
  align?: 'left' | 'center' | 'right';
}

// ── Preview State ──

export interface ReportPreviewState<T = any> {
  // Page setup
  orientation: Orientation;
  paperSize: PaperSize;

  // Column visibility
  visibleColumns: string[];
  toggleColumn: (key: string) => void;

  // Preview settings
  zoom: number;           // 0.25 to 2.0
  currentPage: number;
  totalPages: number;
  reportTitle: string;
  showHeader: boolean;
  showFooter: boolean;
  fontSize: FontSize;
  tableDensity: TableDensity;

  // Data (Paginated)
  paginatedPages: T[][];

  // Actions
  setOrientation: (o: Orientation) => void;
  setPaperSize: (s: PaperSize) => void;
  setZoom: (z: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitWidth: () => void;
  fitPage: () => void;
  goToPage: (page: number) => void;
  setReportTitle: (title: string) => void;
  setShowHeader: (show: boolean) => void;
  setShowFooter: (show: boolean) => void;
  setFontSize: (size: FontSize) => void;
  setTableDensity: (d: TableDensity) => void;
  exportPDF: () => Promise<void>;
  print: () => void;
}

// ── Workspace Props (Generic) ──

export interface DocumentPreviewWorkspaceProps<T> {
  /** Title shown in the title bar */
  title: string;
  /** Column definitions for the table */
  columns: ColumnDefinition<T>[];
  /** Raw data rows */
  data: T[];
  /** Preview state from useReportPreview hook */
  previewState: ReportPreviewState<T>;
  /** Export handler */
  onExportPDF: () => Promise<void>;
  /** Print handler */
  onPrint: () => void;
  /** Close handler */
  onClose: () => void;
  /** Optional domain-specific stats panel renderer */
  statsRenderer?: () => React.ReactNode;
}

// ── Pagination Result ──

export interface PaginationResult<T> {
  /** Data split into pages */
  pages: T[][];
  /** Total number of pages */
  totalPages: number;
  /** Rows per page (for reference) */
  rowsPerPage: number;
}
