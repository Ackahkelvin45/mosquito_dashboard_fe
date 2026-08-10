"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Module-level singleton, not useState: the auth store needs to import this
// directly (outside React) to clear it on every identity change — login,
// logout, guest-mode toggle — so cached data scoped to one user is never
// served to the next user in the same browser tab (this app never remounts
// this provider on navigation, and has no SSR data-fetching through React
// Query, so a browser-wide singleton is safe here).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cached data is served without a refetch for a minute, so navigating
      // away and back doesn't re-hit the API (or re-show skeletons).
      staleTime: 60_000,
    },
  },
})

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>
    {children}
    </QueryClientProvider>
}