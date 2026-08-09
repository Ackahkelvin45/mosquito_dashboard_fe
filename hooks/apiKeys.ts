import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createApiKey, type CreateApiKeyPayload, revokeApiKey, revokeUserKeys } from "@/actions/apiKeyMutation"
import { getApiKeys, type ApiKeyFilters } from "@/queries/apiKeys/apiKeyQueries"

export const useApiKeys = (all = false, filters?: ApiKeyFilters) => {
    return useQuery({
        queryKey: ["api-keys", { all, ...filters }],
        queryFn: () => getApiKeys(all, filters),
        placeholderData: keepPreviousData,
    })
}

export const useCreateApiKey = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateApiKeyPayload) => createApiKey(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] })
        },
    })
}

export const useRevokeApiKey = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (keyId: number) => revokeApiKey(keyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] })
        },
    })
}

export const useRevokeUserKeys = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (userId: number) => revokeUserKeys(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] })
        },
    })
}
