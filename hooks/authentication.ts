"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getCurrentUser } from "@/queries/authentication/authenticationQueries"
import { loginUser, type LoginResult } from "@/actions/authentication/authenticationMutation"
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
    mutationFn: (data: { email: string; password: string }) => loginUser(data),
    onSuccess: (data: LoginResult) => {
      if (data.success) {
        useAuthStore.getState().setAuth(data.access_token,data.refresh_token)
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    },
  })
}