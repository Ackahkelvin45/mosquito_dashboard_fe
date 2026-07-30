import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { getUsers } from "@/queries/user/userQueries"
import { createUser, type CreateUserPayload } from "@/actions/userMutation"
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
