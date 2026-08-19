import { create } from "zustand";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { api } from "@/services/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  initialized: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; password?: string }) => Promise<User>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  loading: false,

  setUser: (user) => set({ user }),

  fetchMe: async () => {
    set({ loading: true });
    try {
      const { user } = await api.me();
      set({ user, initialized: true, loading: false });
      return user;
    } catch {
      set({ user: null, initialized: true, loading: false });
      return null;
    }
  },

  login: async (email, password) => {
    const { user } = await api.login({ email, password });
    set({ user, initialized: true });
    return user;
  },

  register: async (name, email, password) => {
    const { user } = await api.register({ name, email, password });
    set({ user, initialized: true });
    return user;
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({ user: null });
      localStorage.removeItem(LOCAL_STORAGE_KEYS.mergedBookmarks);
    }
  },

  updateProfile: async (data) => {
    const { user } = await api.updateProfile(data);
    set({ user });
    return user;
  },
}));