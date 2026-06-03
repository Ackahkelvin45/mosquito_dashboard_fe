import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user_id: number | null
  _hasHydrated: boolean

  setAuth: (accessToken: string, refreshToken: string, user_id: number) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user_id: null,
      _hasHydrated: false,

      setAuth: (accessToken, refreshToken, user_id) => set({ accessToken, refreshToken, user_id }),
      logout: () => set({ accessToken: null, refreshToken: null, user_id: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      // Only persist the credentials, not transient UI state like _hasHydrated.
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user_id: state.user_id,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)