/**
 * Attendance-specific column definitions for the Document Preview system.
 * Plugs into the generic ColumnDefinition<T> interface.
 */

import type { ColumnDefinition } from '../../document-preview/types';

// ── Attendance Data Shape ──

export interface AttendanceLog {
  idno: string;
  name: string;
  course: string;
  dte_log: string;
  reason: string;
  terminal_id: string;
}

// ── Column Definitions ──

export const ATTENDANCE_COLUMNS: ColumnDefinition<AttendanceLog>[] = [
  {
    key: 'dte_log',
    label: 'Date/Time',
    accessor: (row) => new Date(row.dte_log).toLocaleString(),
    defaultVisible: true,
    width: 2,
    align: 'left',
  },
  {
    key: 'idno',
    label: 'ID No',
    accessor: (row) => row.idno,
    defaultVisible: true,
    width: 1,
    align: 'left',
  },
  {
    key: 'name',
    label: 'Student Name',
    accessor: (row) => row.name,
    defaultVisible: true,
    width: 3,
    align: 'left',
  },
  {
    key: 'course',
    label: 'Course',
    accessor: (row) => row.course,
    defaultVisible: true,
    width: 1,
    align: 'left',
  },
  {
    key: 'reason',
    label: 'Reason',
    accessor: (row) => row.reason,
    defaultVisible: true,
    width: 1,
    align: 'left',
  },
  {
    key: 'terminal_id',
    label: 'Terminal',
    accessor: (row) => row.terminal_id,
    defaultVisible: true,
    width: 1,
    align: 'center',
  },
];
