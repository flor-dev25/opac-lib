/**
 * Shared report configuration constants.
 * Used by BOTH the HTML preview renderer AND the jsPDF generator
 * to guarantee WYSIWYG parity.
 */

import type { PaperSize, FontSize, TableDensity } from '../components/document-preview/types';

// ── Paper Sizes (mm) ──

export interface PaperDimensions {
  /** Width in mm */
  width: number;
  /** Height in mm */
  height: number;
  /** Human-readable label */
  label: string;
}

export const PAPER_SIZES: Record<PaperSize, PaperDimensions> = {
  a4:     { width: 210, height: 297, label: 'A4' },
  letter: { width: 216, height: 279, label: 'Letter' },
  legal:  { width: 216, height: 356, label: 'Legal' },
} as const;

// ── Margins (mm) ──

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_MARGINS: Margins = { top: 20, right: 15, bottom: 15, left: 15 };

// ── Font Sizes (pt — used by both jsPDF and CSS) ──

export interface FontSizeSet {
  header: number;
  subheader: number;
  table: number;
  footer: number;
}

export const FONT_SIZES: Record<FontSize, FontSizeSet> = {
  small:  { header: 18, subheader: 9,  table: 7,  footer: 6 },
  medium: { header: 22, subheader: 12, table: 9,  footer: 8 },
  large:  { header: 26, subheader: 14, table: 11, footer: 10 },
} as const;

// ── Table Density (row height in mm) ──

export const TABLE_DENSITY_ROW_HEIGHT: Record<TableDensity, number> = {
  compact:  5,
  normal:   7,
  relaxed:  10,
} as const;

// ── Header / Footer Heights (mm) ──

export const HEADER_HEIGHT_MM = 55;   // Space for logo + title + stats line
export const FOOTER_HEIGHT_MM = 12;   // Space for page number + app version
export const TABLE_HEADER_HEIGHT_MM = 8; // Table header row

// ── Conversion Utilities ──

/** Convert millimeters to pixels at 96 DPI (for HTML preview) */
export function mmToPx(mm: number): number {
  return Math.round(mm * 96 / 25.4);
}

/** Convert points to pixels at 96 DPI */
export function ptToPx(pt: number): number {
  return Math.round(pt * 96 / 72);
}

/**
 * Get paper dimensions in pixels for HTML preview.
 * Accounts for orientation swap.
 */
export function getPaperDimensionsPx(
  paperSize: PaperSize,
  orientation: 'portrait' | 'landscape'
): { width: number; height: number } {
  const paper = PAPER_SIZES[paperSize];
  const w = orientation === 'landscape' ? paper.height : paper.width;
  const h = orientation === 'landscape' ? paper.width : paper.height;
  return { width: mmToPx(w), height: mmToPx(h) };
}

/**
 * Get the usable content area in mm (paper minus margins).
 */
export function getContentAreaMm(
  paperSize: PaperSize,
  orientation: 'portrait' | 'landscape',
  margins: Margins = DEFAULT_MARGINS
): { width: number; height: number } {
  const paper = PAPER_SIZES[paperSize];
  const w = orientation === 'landscape' ? paper.height : paper.width;
  const h = orientation === 'landscape' ? paper.width : paper.height;
  return {
    width: w - margins.left - margins.right,
    height: h - margins.top - margins.bottom,
  };
}

// ── Zoom Presets ──

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2.0;
export const ZOOM_STEP = 0.1;
export const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;
