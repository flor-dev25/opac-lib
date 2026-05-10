import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Patron {
  name: string;
  idno: string;
  group_name: string;
  course: string | null;
  expiry: string | null;
  dept: string | null;
  phone: string | null;
  email: string | null;
  unpaid_fine: number;
}

interface PatronState {
  patrons: Patron[];
  totalPatrons: number;
  currentPage: number;
  searchQuery: string;
  selectedIdno: string | null;
  isLoading: boolean;
  error: string | null;
  setSelectedIdno: (idno: string | null) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  fetchPatrons: (page?: number) => Promise<void>;
  addPatron: (patron: Patron) => Promise<void>;
  updatePatron: (idno: string, patron: Patron) => Promise<void>;
  deletePatron: (idno: string) => Promise<void>;
  payFine: (idno: string, amount: number) => Promise<void>;
  addPatrons: (patrons: Patron[]) => Promise<void>;
}

export const usePatronStore = create<PatronState>((set, get) => ({
  patrons: [],
  totalPatrons: 0,
  currentPage: 1,
  searchQuery: '',
  selectedIdno: null,
  isLoading: false,
  error: null,
  setSelectedIdno: (idno) => set({ selectedIdno: idno }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  fetchPatrons: async (page) => {
    const p = page ?? get().currentPage;
    const query = get().searchQuery;
    set({ isLoading: true, currentPage: p });
    try {
      const offset = (p - 1) * 20;
      let patrons, total;
      
      if (query.trim()) {
        [patrons, total] = await Promise.all([
          invoke<Patron[]>('search_patrons', { query, offset }),
          invoke<number>('get_search_patron_count', { query })
        ]);
      } else {
        [patrons, total] = await Promise.all([
          invoke<Patron[]>('get_patrons', { offset }),
          invoke<number>('get_patron_count')
        ]);
      }
      
      set({ patrons, totalPatrons: total, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },
  addPatron: async (patron) => {
    try {
      await invoke('add_patron', { patron });
      await get().fetchPatrons();
    } catch (e) {
      alert(`Add failed: ${e}`);
    }
  },
  updatePatron: async (idno, patron) => {
    try {
      await invoke('update_patron', { idno, patron });
      await get().fetchPatrons();
    } catch (e) {
      alert(`Update failed: ${e}`);
    }
  },
  deletePatron: async (idno) => {
    try {
      await invoke('delete_patron', { idno });
      set((state) => ({
        patrons: state.patrons.filter(p => p.idno !== idno),
        selectedIdno: state.selectedIdno === idno ? null : state.selectedIdno
      }));
    } catch (e) {
      alert(`Delete failed: ${e}`);
    }
  },
  payFine: async (idno, amount) => {
    try {
      await invoke('pay_fine', { idno, amount });
      set((state) => ({
        patrons: state.patrons.map(p =>
          p.idno === idno ? { ...p, unpaid_fine: Math.max(0, p.unpaid_fine - amount) } : p
        ),
      }));
    } catch (e) {
      alert(`Payment failed: ${e}`);
    }
  },
  addPatrons: async (patrons) => {
    set({ isLoading: true, error: null });
    try {
      // Add each patron individually (since we don't have a batch command yet)
      for (const patron of patrons) {
        await invoke('add_patron', { patron });
      }
      // After all are added, refresh the patron list
      await get().fetchPatrons();
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  }
}));
