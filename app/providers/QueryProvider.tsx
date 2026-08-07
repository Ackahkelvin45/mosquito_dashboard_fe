"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"


export default function QueryProvider({ children }: { children: React.ReactNode }) {
const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cached data is served without a refetch for a minute, so navigating
        // away and back doesn't re-hit the API (or re-show skeletons).
        staleTime: 60_000,
      },
    },
  }))

  return <QueryClientProvider client={queryClient}>
    {children}
    </QueryClientProvider>
}