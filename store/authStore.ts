import { create } from "zustand"
import { persist } from "zustand/middleware"
import { queryClient } from "@/app/providers/QueryProvider"

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

      // Every identity change clears the query cache first: without this, a
      // second user logging into the same browser tab can be served the
      // first user's cached, differently-scoped dashboard/device data for up
      // to staleTime (60s) — this provider never remounts on navigation, so
      // nothing else invalidates it.
      // Signing in always ends guest mode.
      setAuth: (accessToken, refreshToken, user_id) => {
        queryClient.clear()
        set({ accessToken, refreshToken, user_id, isGuest: false })
      },
      enterGuestMode: () => {
        queryClient.clear()
        set({ accessToken: null, refreshToken: null, user_id: null, isGuest: true })
      },
      exitGuestMode: () => {
        queryClient.clear()
        set({ isGuest: false })
      },
      logout: () => {
        queryClient.clear()
        set({ accessToken: null, refreshToken: null, user_id: null, isGuest: false })
      },
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
