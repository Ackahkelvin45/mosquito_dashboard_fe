import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { getUsers, getUserById } from "@/queries/user/userQueries"
import { createUser, type CreateUserPayload, updateUser, type UpdateUserPayload } from "@/actions/userMutation"
import type { PaginationParams } from "@/lib/pagination"

export const useUsers = (pagination?: PaginationParams) => {
    return useQuery({
        queryKey: ["users", pagination ?? null],
        queryFn: () => getUsers(pagination),
        placeholderData: keepPreviousData,
    })
}

export const useCreateUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateUserPayload) => createUser(data),
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ["users"] })
            }
        },
    })
}

export const useUser = (userId: number | string) => {
    return useQuery({
        queryKey: ["user", String(userId)],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    })
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, data }: { userId: number | string, data: UpdateUserPayload }) => updateUser(userId, data),
        onSuccess: (result, { userId }) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ["users"] })
                queryClient.invalidateQueries({ queryKey: ["user", String(userId)] })
            }
        },
    })
}
