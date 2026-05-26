import { create } from "zustand";
import { api, type ClassGroup } from "@/lib/api";

interface GroupsStore {
  groups: ClassGroup[];
  loading: boolean;
  fetchGroups: () => Promise<void>;
  createGroup: (data: {
    name: string;
    grade: string;
    section: string;
    subject: string;
    studentCount: number;
    description?: string;
  }) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

export const useGroupsStore = create<GroupsStore>((set, get) => ({
  groups: [],
  loading: false,

  fetchGroups: async () => {
    set({ loading: true });
    try {
      const groups = await api.getGroups();
      set({ groups, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createGroup: async (data) => {
    const group = await api.createGroup(data);
    set((state) => ({ groups: [group, ...state.groups] }));
  },

  deleteGroup: async (id) => {
    await api.deleteGroup(id);
    set((state) => ({
      groups: state.groups.filter((g) => g._id !== id),
    }));
  },
}));
