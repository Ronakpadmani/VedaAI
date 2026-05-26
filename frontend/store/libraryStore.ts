import { create } from "zustand";
import { api, type LibraryItem } from "@/lib/api";

interface LibraryStore {
  items: LibraryItem[];
  loading: boolean;
  fetchLibrary: (params?: { subject?: string; search?: string }) => Promise<void>;
  saveFromAssignment: (assignmentId: string) => Promise<void>;
  syncCompleted: () => Promise<number>;
  deleteItem: (id: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  items: [],
  loading: false,

  fetchLibrary: async (params) => {
    set({ loading: true });
    try {
      const items = await api.getLibrary(params);
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  saveFromAssignment: async (assignmentId) => {
    const item = await api.saveToLibrary(assignmentId);
    set((state) => {
      const exists = state.items.some((i) => i._id === item._id);
      if (exists) return state;
      return { items: [item, ...state.items] };
    });
  },

  syncCompleted: async () => {
    const { synced } = await api.syncLibrary();
    const items = await api.getLibrary();
    set({ items });
    return synced;
  },

  deleteItem: async (id) => {
    await api.deleteLibraryItem(id);
    set((state) => ({
      items: state.items.filter((i) => i._id !== id),
    }));
  },
}));
