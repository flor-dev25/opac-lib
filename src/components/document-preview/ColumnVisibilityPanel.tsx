/**
 * ColumnVisibilityPanel — Left panel for toggling table columns on/off.
 * Generic component: works with any ColumnDefinition<T>.
 * Win95/98 aesthetic with beveled sections.
 */

import React from 'react';
import { Eye, EyeOff, Columns3 } from 'lucide-react';
import type { ColumnDefinition } from './types';
import { BeveledBox } from '../common/BeveledBox';

interface ColumnVisibilityPanelProps<T> {
  /** All available column definitions */
  columns: ColumnDefinition<T>[];
  /** Currently visible column keys */
  visibleColumns: string[];
  /** Toggle a column's visibility */
  onToggle: (key: string) => void;
}

function ColumnVisibilityPanelInner<T>({
  columns,
  visibleColumns,
  onToggle,
}: ColumnVisibilityPanelProps<T>) {
  const visibleCount = visibleColumns.length;

  return (
    <div className="flex flex-col h-full bg-classic-grey dark:bg-dark-panel overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-400 dark:border-gray-700">
        <Columns3 size={14} className="text-gray-600 dark:text-gray-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Columns
        </span>
        <span className="ml-auto text-[9px] text-gray-500 tabular-nums">
          {visibleCount}/{columns.length}
        </span>
      </div>

      {/* Column List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {columns.map((col) => {
          const isVisible = visibleColumns.includes(col.key);
          const isLastVisible = isVisible && visibleCount <= 1;

          return (
            <BeveledBox
              key={col.key}
              variant="sunken"
              padding="p-0"
              className={`
                flex items-center gap-2 px-2 py-1.5 cursor-pointer select-none
                transition-colors text-xs
                ${isVisible
                  ? 'bg-white dark:bg-black/20 text-gray-900 dark:text-gray-100'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                }
                ${isLastVisible ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'}
              `}
              onClick={() => !isLastVisible && onToggle(col.key)}
            >
              {/* Checkbox */}
              <div
                className={`
                  w-3.5 h-3.5 border-2 flex items-center justify-center flex-shrink-0
                  ${isVisible
                    ? 'border-[#000080] dark:border-blue-400 bg-white dark:bg-black/30'
                    : 'border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
                  }
                `}
              >
                {isVisible && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2 text-[#000080] dark:text-blue-400">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Label */}
              <span className="flex-1 truncate font-medium">{col.label}</span>

              {/* Visibility Icon */}
              {isVisible ? (
                <Eye size={12} className="text-gray-400 flex-shrink-0" />
              ) : (
                <EyeOff size={12} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
            </BeveledBox>
          );
        })}
      </div>

      {/* Footer Hint */}
      <div className="px-3 py-1.5 border-t border-gray-400 dark:border-gray-700">
        <p className="text-[8px] text-gray-500 dark:text-gray-500 uppercase tracking-wider">
          Click to toggle • Min 1 required
        </p>
      </div>
    </div>
  );
}

// Export with generic wrapper (React.memo doesn't support generics directly)
export const ColumnVisibilityPanel = React.memo(ColumnVisibilityPanelInner) as typeof ColumnVisibilityPanelInner;
