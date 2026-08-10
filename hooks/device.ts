import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { createDevice, type CreateDevicePayload, createDeviceCluster, type CreateDeviceClusterPayload, deleteDevice, updateDevice, type UpdateDevicePayload, updateDeviceCluster, type UpdateDeviceClusterPayload } from "@/actions/deviceMutation"
import { getDevices, type GetDevicesFilters, getClusters, getClusterById, getDeviceById, getAllSensorReadings, type GetAllSensorReadingsFilters } from "@/queries/device/deviceQueries"
import { getDeviceCharts, type ChartGroupBy } from "@/queries/device/deviceChartsQueries"
import type { PaginationParams } from "@/lib/pagination"

function getId(value: unknown): string | number | null {
    if (!value || typeof value !== "object") return null
    const id = (value as Record<string, unknown>).id
    if (typeof id === "string" || typeof id === "number") return id
    return null
}

export const useCreateDevice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateDevicePayload) => createDevice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["devices"] })
        },
    })
}

export const useUpdateDevice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ deviceId, data }: { deviceId: string | number, data: UpdateDevicePayload }) => updateDevice(deviceId, data),
        onSuccess: (_, { deviceId }) => {
            queryClient.invalidateQueries({ queryKey: ["devices"] })
            queryClient.invalidateQueries({ queryKey: ["device", deviceId] })
        },
    })
}

export const useDeleteDevice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (deviceId: string | number) => deleteDevice(deviceId),
        onSuccess: (_, deletedDeviceId) => {
            queryClient.setQueryData(["devices"], (oldData: unknown) => {
                if (!oldData) return oldData
                if (Array.isArray(oldData)) {
                    return oldData.filter((device) => getId(device) !== deletedDeviceId)
                }

                if (typeof oldData === "object" && oldData !== null) {
                    const record = oldData as Record<string, unknown>
                    const data = record.data
                    if (Array.isArray(data)) {
                    return {
                        ...record,
                        data: data.filter((device) => getId(device) !== deletedDeviceId),
                    }
                    }
                }
                return oldData
            })
            queryClient.invalidateQueries({ queryKey: ["devices"] })
        },
    })
}

export const useCreateCluster = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateDeviceClusterPayload) => createDeviceCluster(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clusters"] })
        },
    })
}

export const useUpdateCluster = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ clusterId, data }: { clusterId: string | number, data: UpdateDeviceClusterPayload }) => updateDeviceCluster(clusterId, data),
        onSuccess: (_, { clusterId }) => {
            queryClient.invalidateQueries({ queryKey: ["clusters"] })
            // useCluster keys by the string route param.
            queryClient.invalidateQueries({ queryKey: ["cluster", String(clusterId)] })
            // Membership changes affect which users show a cluster.
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })
}

// Live surveillance data — polled so Online/Offline status and new readings
// show up without the user having to navigate away and back (see
// hooks/notification.ts's useUnreadCount for the same convention).
const LIVE_REFETCH_MS = 30_000

export const useDevices = (filters?: GetDevicesFilters, pagination?: PaginationParams) => {
    return useQuery({
        queryKey: ["devices", filters ?? null, pagination ?? null],
        queryFn: () => getDevices(filters, pagination),
        placeholderData: keepPreviousData,
        refetchInterval: LIVE_REFETCH_MS,
        refetchOnWindowFocus: true,
    })
}

export const useDevice = (id: string | number) => {
    return useQuery({
        queryKey: ["device", id],
        queryFn: () => getDeviceById(id),
        enabled: !!id,
        refetchInterval: LIVE_REFETCH_MS,
        refetchOnWindowFocus: true,
    })
}

export const useClusters = (pagination?: PaginationParams) => {
    return useQuery({
        queryKey: ["clusters", pagination ?? null],
        queryFn: () => getClusters(pagination),
    })
}

export const useCluster = (id: string) => {
    return useQuery({
        queryKey: ["cluster", id],
        queryFn: () => getClusterById(id),
        enabled: !!id,
    })
}

export const useDeviceCharts = (deviceId: string | number, groupBy: ChartGroupBy = "month") => {
    return useQuery({
        queryKey: ["device-charts", deviceId, groupBy],
        queryFn: () => getDeviceCharts(deviceId, groupBy),
        enabled: !!deviceId,
        refetchInterval: LIVE_REFETCH_MS,
        refetchOnWindowFocus: true,
    })
}

export const useAllSensorReadings = (
    filters?: GetAllSensorReadingsFilters,
    pagination?: PaginationParams,
) => {
    return useQuery({
        queryKey: ["sensor-readings", filters ?? {}, pagination ?? null],
        queryFn: () => getAllSensorReadings(filters, pagination),
        placeholderData: keepPreviousData,
        refetchInterval: LIVE_REFETCH_MS,
        refetchOnWindowFocus: true,
    })
}
