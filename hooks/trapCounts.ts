import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getTrapCollections } from "@/queries/trapCounts/trapCountQueries"
import { getDevices, type GetDevicesFilters } from "@/queries/device/deviceQueries"
import { MAX_PAGE_SIZE } from "@/lib/pagination"
import type { Device } from "@/types/api"
import {
  createTrapCounts, deleteTrapCount, updateTrapCount, type CreateTrapCountsPayload,
} from "@/actions/trapCountMutation"

const KEY = ["trap-counts"]

export const useTrapCollections = () =>
  useQuery({ queryKey: KEY, queryFn: getTrapCollections, refetchOnWindowFocus: true })

export const useCreateTrapCounts = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTrapCountsPayload) => createTrapCounts(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export const useUpdateTrapCount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, count }: { id: number; count: number }) => updateTrapCount(id, { count }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

export const useDeleteTrapCount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTrapCount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  })
}

// Every device matching the filters, walking all pages (the API caps
// page_size at 100) so the picker never silently drops devices.
export const useAllDevices = (filters: GetDevicesFilters | undefined, enabled = true) =>
  useQuery({
    queryKey: ["devices", "all", filters ?? null],
    enabled,
    queryFn: async () => {
      const all: Device[] = []
      for (let page = 1; ; page++) {
        const res = await getDevices(filters, { page, page_size: MAX_PAGE_SIZE })
        all.push(...res.items)
        if (page >= res.total_pages) return all
      }
    },
  })
