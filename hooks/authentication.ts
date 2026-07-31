"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getCurrentUser } from "@/queries/authentication/authenticationQueries"
import { loginUser, type LoginResult, registerUser, type RegisterFormData, updateResearcherRequestStatus, requestPasswordReset, verifyPasswordResetOtp, resetPassword } from "@/actions/authentication/authenticationMutation"
import { useAuthStore } from "@/store/authStore"

export const useCurrentUser = () => {
  // Guests have no account — never call /auth/me for them (it would 401).
  const isGuest = useAuthStore((s) => s.isGuest)
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !isGuest,
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => loginUser(data),
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

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  })
}

export const useVerifyPasswordResetOtp = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => verifyPasswordResetOtp(email, otp),
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ email, otp, new_password }: { email: string; otp: string; new_password: string }) =>
      resetPassword(email, otp, new_password),
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