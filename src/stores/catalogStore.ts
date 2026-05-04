import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface CatalogRecord {
  id: number;
  title: string;
  author: string;
  callno: string;
  year: string;
  controlNo?: string;
}

interface CatalogEntry {
  controlno: string;
  title: string;
  callno?: string;
  author_code: number;
  edition?: string;
  pagination?: string;
  publisher?: string;
  pubplace?: string;
  copyright?: string;
  isbn?: string;
  subject1_code?: number;
  subject2_code?: number;
  subject3_code?: number;
  series_title?: string;
  a_entry_title?: string;
  ae_author1_code?: number;
  ae_author2_code?: number;
  ae_author3_code?: number;
  material?: string;
  x_notes?: string;
}

interface Holding {
  controlno: string;
  accession: string;
  copy: string;
  location: string;
  due_date?: string;
  status: string;
  last_audit?: string;
}

interface CatalogState {
  records: CatalogRecord[];
  selectedId: number | undefined;
  isLoading: boolean;
  error: string | null;
  isEditDialogOpen: boolean;
  editingControlNo: string | null;
  setSelectedId: (id: number | undefined) => void;
  setEditDialogOpen: (open: boolean) => void;
  setEditingControlNo: (controlno: string | null) => void;
  fetchRecords: () => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  fetchFullEntry: (controlno: string) => Promise<CatalogEntry>;
  updateEntry: (entry: CatalogEntry) => Promise<void>;
  fetchHoldings: (controlno: string) => Promise<Holding[]>;
  saveHolding: (holding: Holding) => Promise<void>;
  deleteHolding: (accession: String) => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  records: [],
  selectedId: undefined,
  isLoading: false,
  error: null,
  isEditDialogOpen: false,
  editingControlNo: null,
  setSelectedId: (id) => set({ selectedId: id }),
  setEditDialogOpen: (open) => set({ isEditDialogOpen: open }),
  setEditingControlNo: (controlno) => set({ editingControlNo: controlno }),
  fetchRecords: async () => {
    set({ isLoading: true });
    try {
      const records = await invoke<CatalogRecord[]>('get_catalog_records');
      set({ records, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },
  deleteRecord: async (id) => {
    const record = get().records.find(r => r.id === id);
    if (!record || !record.controlNo) return;

    try {
      await invoke('delete_catalog_record', { controlno: record.controlNo });
      set((state) => ({
        records: state.records.filter(r => r.id !== id),
        selectedId: state.selectedId === id ? undefined : state.selectedId
      }));
    } catch (e) {
      alert(`Delete failed: ${e}`);
    }
  },
  fetchFullEntry: async (controlno) => {
    return await invoke<CatalogEntry>('get_catalog_entry', { controlno });
  },
  updateEntry: async (entry) => {
    await invoke('update_catalog_record', { entry });
    // Refresh records list to reflect changes in dashboard
    await get().fetchRecords();
  },
  fetchHoldings: async (controlno) => {
    return await invoke<Holding[]>('get_holdings', { controlno });
  },
  saveHolding: async (holding) => {
    await invoke('add_holding', { holding });
  },
  deleteHolding: async (accession) => {
    await invoke('delete_holding', { accession });
  },
}));
