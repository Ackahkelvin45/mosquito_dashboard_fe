import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user_id: number | null
  // Anonymous read-only "View as Guest" session — mutually exclusive with tokens.
  isGuest: boolean
  _hasHydrated: boolean

  setAuth: (accessToken: string, refreshToken: string, user_id: number) => void
  enterGuestMode: () => void
  exitGuestMode: () => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user_id: null,
      isGuest: false,
      _hasHydrated: false,

      // Signing in always ends guest mode.
      setAuth: (accessToken, refreshToken, user_id) =>
        set({ accessToken, refreshToken, user_id, isGuest: false }),
      enterGuestMode: () =>
        set({ accessToken: null, refreshToken: null, user_id: null, isGuest: true }),
      exitGuestMode: () => set({ isGuest: false }),
      logout: () => set({ accessToken: null, refreshToken: null, user_id: null, isGuest: false }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      // Only persist the credentials, not transient UI state like _hasHydrated.
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user_id: state.user_id,
        isGuest: state.isGuest,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
