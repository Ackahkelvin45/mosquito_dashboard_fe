import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/queries/user/userQueries"

export const useUsers = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    })
}
