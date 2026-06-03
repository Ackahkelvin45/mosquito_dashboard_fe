import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { getUsers } from "@/queries/user/userQueries"
import type { PaginationParams } from "@/lib/pagination"

export const useUsers = (pagination?: PaginationParams) => {
    return useQuery({
        queryKey: ["users", pagination ?? null],
        queryFn: () => getUsers(pagination),
        placeholderData: keepPreviousData,
    })
}
