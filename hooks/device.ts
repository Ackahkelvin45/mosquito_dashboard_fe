import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createDevice, type CreateDevicePayload } from "@/actions/deviceMutation"
import { getDevices } from "@/queries/device/deviceQueries"

export const useCreateDevice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateDevicePayload) => createDevice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["devices"] })
        },
    })
}

export const useDevices = () => {
    return useQuery({
        queryKey: ["devices"],
        queryFn: getDevices,
    })
}