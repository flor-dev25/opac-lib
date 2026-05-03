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

interface CatalogState {
  records: CatalogRecord[];
  selectedId: number | undefined;
  isLoading: boolean;
  error: string | null;
  setSelectedId: (id: number | undefined) => void;
  fetchRecords: () => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  records: [],
  selectedId: undefined,
  isLoading: false,
  error: null,
  setSelectedId: (id) => set({ selectedId: id }),
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
}));
