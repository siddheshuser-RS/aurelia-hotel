"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hotelApi, setAuthToken } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

type AuthState = {
  token?: string;
  user?: AuthUser;
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: undefined,
      user: undefined,
      hydrated: false,
      setSession: (token, user) => {
        setAuthToken(token);
        set({ token, user });
      },
      logout: () => {
        setAuthToken(undefined);
        set({ token: undefined, user: undefined });
      },
      refreshUser: async () => {
        if (!get().token) return;
        try {
          const me = await hotelApi.me();
          set({ user: me });
        } catch {
          // token invalid → clear
          setAuthToken(undefined);
          set({ token: undefined, user: undefined });
        }
      }
    }),
    {
      name: "aurelia-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token);
        // mark hydrated even if state is undefined
        useAuthStore.setState({ hydrated: true });
      }
    }
  )
);
