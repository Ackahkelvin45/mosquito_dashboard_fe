"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getCurrentUser } from "@/queries/authentication/authenticationQueries"
import { loginUser, type LoginResult, registerUser, type RegisterFormData, updateResearcherRequestStatus } from "@/actions/authentication/authenticationMutation"
import { useAuthStore } from "@/store/authStore"

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; password: string ,user_id: number}) => loginUser(data),
    onSuccess: (data: LoginResult) => {
      if (data.success) { 
        useAuthStore.getState().setAuth(data.access_token,data.refresh_token,data.user_id)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: RegisterFormData) => registerUser(data),
  })
}

export const useUpdateResearcherStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: "approved" | "declined" }) =>
      updateResearcherRequestStatus(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["researcherRequests"] })
    },
  })
}