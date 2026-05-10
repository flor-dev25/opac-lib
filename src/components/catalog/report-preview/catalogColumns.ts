import { ColumnDefinition } from '../../document-preview/types';

export interface CatalogRecord {
  id: number;
  title: string;
  author: string;
  callno: string;
  year: string;
  controlno?: string;
}

export const CATALOG_COLUMNS: ColumnDefinition<CatalogRecord>[] = [
  {
    key: 'controlno',
    label: 'Control No',
    width: 30,
    accessor: (row) => row.controlno || row.id.toString(),
    defaultVisible: true,
  },
  {
    key: 'callno',
    label: 'Call Number',
    width: 35,
    accessor: (row) => row.callno,
    defaultVisible: true,
  },
  {
    key: 'title',
    label: 'Book Title',
    width: 80,
    accessor: (row) => row.title,
    defaultVisible: true,
  },
  {
    key: 'author',
    label: 'Author',
    width: 50,
    accessor: (row) => row.author,
    defaultVisible: true,
  },
  {
    key: 'year',
    label: 'Year',
    width: 20,
    accessor: (row) => row.year,
    align: 'center',
    defaultVisible: true,
  }
];
