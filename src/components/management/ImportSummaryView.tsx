import React from 'react';
import { BeveledBox } from '../common/BeveledBox';

interface InvalidRow {
  table: string;
  reason: string;
  row_preview: string;
}

export interface ImportSummaryData {
  backup_path: string;
  inserted: Record<string, number>;
  skipped: Record<string, number>;
  invalid: InvalidRow[];
  duration_ms: number;
}

interface ImportSummaryViewProps {
  summary: ImportSummaryData;
}

export const ImportSummaryView: React.FC<ImportSummaryViewProps> = ({ summary }) => {
  const tableNames = Array.from(new Set([
    ...Object.keys(summary.inserted),
    ...Object.keys(summary.skipped)
  ])).sort();

  return (
    <div className="space-y-4">
      <div className="bg-classic-grey dark:bg-dark-surface border border-gray-400 dark:border-dark-border p-2 text-sm max-h-[250px] overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-dark-highlight sticky top-0">
              <th className="p-1 border border-gray-400 dark:border-dark-border">Table</th>
              <th className="p-1 border border-gray-400 dark:border-dark-border text-right text-green-600 dark:text-green-400">Inserted</th>
              <th className="p-1 border border-gray-400 dark:border-dark-border text-right text-blue-600 dark:text-blue-400">Skipped (Dup)</th>
              <th className="p-1 border border-gray-400 dark:border-dark-border text-right text-red-600 dark:text-red-400">Errors</th>
            </tr>
          </thead>
          <tbody>
            {tableNames.map(name => {
              const ins = summary.inserted[name] || 0;
              const skip = summary.skipped[name] || 0;
              const errs = summary.invalid.filter(i => i.table === name).length;
              if (ins === 0 && skip === 0 && errs === 0) return null;
              return (
                <tr key={name} className="hover:bg-gray-100 dark:hover:bg-dark-highlight/50">
                  <td className="p-1 border border-gray-400 dark:border-dark-border font-medium">{name}</td>
                  <td className="p-1 border border-gray-400 dark:border-dark-border text-right">{ins}</td>
                  <td className="p-1 border border-gray-400 dark:border-dark-border text-right">{skip}</td>
                  <td className="p-1 border border-gray-400 dark:border-dark-border text-right">{errs > 0 ? errs : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white dark:bg-dark-surface border-2 border-dashed border-gray-300 dark:border-dark-border p-2 text-xs font-mono break-all text-gray-600 dark:text-gray-400">
        <p className="font-bold text-black dark:text-white mb-1">Backup Created:</p>
        {summary.backup_path}
      </div>

      <div className="text-right text-xs text-gray-500 dark:text-gray-400">
        Total duration: {(summary.duration_ms / 1000).toFixed(2)}s
      </div>
    </div>
  );
};
