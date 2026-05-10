import { ColumnDefinition } from '../../document-preview/types';
import { Patron } from '../../../stores/patronStore';

export const ACCOUNT_COLUMNS: ColumnDefinition<Patron>[] = [
  {
    key: 'idno',
    label: 'ID Number',
    width: 30,
    accessor: (row) => row.idno,
    defaultVisible: true,
  },
  {
    key: 'name',
    label: 'Full Name',
    width: 60,
    accessor: (row) => row.name,
    defaultVisible: true,
  },
  {
    key: 'group_name',
    label: 'Type',
    width: 25,
    accessor: (row) => row.group_name,
    defaultVisible: true,
  },
  {
    key: 'course',
    label: 'Course/Program',
    width: 40,
    accessor: (row) => row.course || 'N/A',
    defaultVisible: true,
  },
  {
    key: 'dept',
    label: 'Department',
    width: 40,
    accessor: (row) => row.dept || 'N/A',
    defaultVisible: true,
  },
  {
    key: 'unpaid_fine',
    label: 'Unpaid Fine',
    width: 25,
    accessor: (row) => row.unpaid_fine.toFixed(2),
    align: 'right',
    defaultVisible: true,
  }
];
