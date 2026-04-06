import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createDevice, type CreateDevicePayload, createDeviceCluster, type CreateDeviceClusterPayload, deleteDevice, updateDevice, type UpdateDevicePayload } from "@/actions/deviceMutation"
import { getDevices, getClusters, getClusterById, getDeviceById } from "@/queries/device/deviceQueries"

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
            queryClient.setQueryData(["devices"], (oldData: any) => {
                if (!oldData) return oldData;
                if (Array.isArray(oldData)) {
                    return oldData.filter((device: any) => device.id !== deletedDeviceId);
                } else if (oldData.data && Array.isArray(oldData.data)) {
                    return {
                        ...oldData,
                        data: oldData.data.filter((device: any) => device.id !== deletedDeviceId)
                    };
                }
                return oldData;
            });
            queryClient.invalidateQueries({ queryKey: ["devices"] });
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

export const useDevices = () => {
    return useQuery({
        queryKey: ["devices"],
        queryFn: getDevices,
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