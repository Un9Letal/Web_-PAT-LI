import { create } from 'zustand';
import { Usuario, UserRole } from '@/types';

interface AuthState {
  user: Usuario | null;
  role: UserRole | null;
  isLoading: boolean;
  setUser: (user: Usuario | null, role: UserRole | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user, role) => set({ user, role, isLoading: false }),
  logout: () => set({ user: null, role: null, isLoading: false }),
}));