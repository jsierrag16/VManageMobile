import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

type AuthState = {
  usuario: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { usuario: AuthUser; accessToken: string }) => void;
  updateUsuario: (usuario: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: ({ usuario, accessToken }) =>
    set({
      usuario,
      accessToken,
      isAuthenticated: true,
    }),

  updateUsuario: (usuario) =>
    set((state) => ({
      usuario,
      accessToken: state.accessToken,
      isAuthenticated: true,
    })),

  clearAuth: () =>
    set({
      usuario: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));