/**
 * documentReportGenerator — Generic PDF generator for tabular reports.
 * Uses ColumnDefinition<T> to guarantee 100% WYSIWYG parity with HTML preview.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { 
  DEFAULT_MARGINS, 
  FONT_SIZES,
} from './reportConfig';
import type { ColumnDefinition } from '../components/document-preview/types';

export interface ReportOptions<T> {
  title: string;
  subtitle?: string;
  columns: ColumnDefinition<T>[];
  visibleColumns: string[];
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'a4' | 'letter' | 'legal';
  fontSize?: 'small' | 'medium' | 'large';
  /** Optional custom stats lines */
  stats?: string[];
}

/**
 * Generate a PDF from any tabular data T using a generic column definition.
 */
export async function generateDocumentPDF<T>(data: T[], options: ReportOptions<T>): Promise<ArrayBuffer> {
  const {
    title,
    subtitle = `Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
    columns,
    visibleColumns,
    orientation = 'portrait',
    paperSize = 'a4',
    fontSize = 'medium',
    stats = []
  } = options;

  const fontSet = FONT_SIZES[fontSize];
  
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: paperSize.toUpperCase()
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Header (Page 1 Only) ──
  doc.setDrawColor(0, 0, 128);
  doc.setLineWidth(0.5);
  doc.line(DEFAULT_MARGINS.left, DEFAULT_MARGINS.top + 12, pageWidth - DEFAULT_MARGINS.right, DEFAULT_MARGINS.top + 12);

  doc.setFontSize(fontSet.header);
  doc.setTextColor(0, 0, 128);
  doc.setFont('helvetica', 'bold');
  doc.text(title, DEFAULT_MARGINS.left, DEFAULT_MARGINS.top + 8);

  doc.setFontSize(fontSet.subheader);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, DEFAULT_MARGINS.left, DEFAULT_MARGINS.top + 18);
  
  // Custom Stats lines
  if (stats.length > 0) {
    doc.setFontSize(fontSet.table);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    let currentY = DEFAULT_MARGINS.top + 26;
    stats.forEach(line => {
      doc.text(line, DEFAULT_MARGINS.left, currentY);
      currentY += 5;
    });
  }

  // ── Table ──
  const filteredCols = columns.filter(c => visibleColumns.includes(c.key));
  const head = [filteredCols.map(c => c.label)];
  const body = data.map(row => filteredCols.map(c => c.accessor(row).toString()));

  autoTable(doc, {
    startY: DEFAULT_MARGINS.top + 38 + (stats.length > 0 ? (stats.length * 5) : 0),
    head: head,
    body: body,
    headStyles: { 
      fillColor: [0, 0, 128], 
      textColor: 255, 
      fontSize: fontSet.table,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: fontSet.table,
      textColor: 50
    },
    columnStyles: filteredCols.reduce((acc, col, idx) => {
      if (col.align) {
        acc[idx] = { halign: col.align };
      }
      return acc;
    }, {} as any),
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: DEFAULT_MARGINS,
    didDrawPage: () => {
      // ── Footer (On Every Page) ──
      doc.setFontSize(fontSet.footer);
      doc.setTextColor(150);
      doc.setFont('helvetica', 'bold');
      
      const footerY = pageHeight - 10;
      
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(DEFAULT_MARGINS.left, footerY - 2, pageWidth - DEFAULT_MARGINS.right, footerY - 2);

      doc.text(
        'infoLib v1.0 — Security & Management System',
        DEFAULT_MARGINS.left,
        footerY + 2
      );
      
      const pageNumber = `Page ${doc.internal.pages.length - 1}`;
      doc.text(
        pageNumber,
        pageWidth - DEFAULT_MARGINS.right - doc.getTextWidth(pageNumber),
        footerY + 2
      );
    }
  });

  return doc.output('arraybuffer');
}
