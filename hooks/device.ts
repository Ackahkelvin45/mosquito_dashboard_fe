import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createDevice, type CreateDevicePayload, createDeviceCluster, type CreateDeviceClusterPayload, deleteDevice, updateDevice, type UpdateDevicePayload } from "@/actions/deviceMutation"
import { getDevices, type GetDevicesFilters, getClusters, getClusterById, getDeviceById } from "@/queries/device/deviceQueries"
import { getDeviceCharts, type ChartGroupBy } from "@/queries/device/deviceChartsQueries"

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

export const useDevices = (filters?: GetDevicesFilters) => {
    return useQuery({
        queryKey: ["devices", filters ?? null],
        queryFn: () => getDevices(filters),
    })
}

export const useDevice = (id: string | number) => {
    return useQuery({
        queryKey: ["device", id],
        queryFn: () => getDeviceById(id),
        enabled: !!id,
    })
}

export const useClusters = () => {
    return useQuery({
        queryKey: ["clusters"],
        queryFn: getClusters,
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
    })
}
