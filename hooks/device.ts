import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createDevice, type CreateDevicePayload, createDeviceCluster, type CreateDeviceClusterPayload } from "@/actions/deviceMutation"
import { getDevices, getClusters, getClusterById } from "@/queries/device/deviceQueries"

export const useCreateDevice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateDevicePayload) => createDevice(data),
        onSuccess: () => {
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

export const useDevices = () => {
    return useQuery({
        queryKey: ["devices"],
        queryFn: getDevices,
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