import { create } from 'zustand';

interface CatalogRecord {
  id: number;
  title: string;
  author: string;
  callno: string;
  year: string;
  controlNo?: string;
}

interface CatalogState {
  records: CatalogRecord[];
  selectedId: number | undefined;
  setSelectedId: (id: number | undefined) => void;
  deleteRecord: (id: number) => void;
}

const MOCK_DATA: CatalogRecord[] = [
  { id: 1, title: 'Introduction to Algorithms', author: 'Cormen, Thomas H.', callno: 'QA76.6 .I585 2009', year: '2009', controlNo: '081007084930' },
  { id: 2, title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Martin, Robert C.', callno: 'QA76.76.D47 M37 2008', year: '2008', controlNo: '081007084931' },
  { id: 3, title: 'The Pragmatic Programmer', author: 'Hunt, Andrew', callno: 'QA76.6 .H86 1999', year: '1999', controlNo: '081007084932' },
  { id: 4, title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Gamma, Erich', callno: 'QA76.64 .D47 1994', year: '1994', controlNo: '081007084933' },
];

export const useCatalogStore = create<CatalogState>((set) => ({
  records: MOCK_DATA,
  selectedId: 1,
  setSelectedId: (id) => set({ selectedId: id }),
  deleteRecord: (id) => set((state) => ({
    records: state.records.filter(r => r.id !== id),
    selectedId: state.selectedId === id ? undefined : state.selectedId
  })),
}));
