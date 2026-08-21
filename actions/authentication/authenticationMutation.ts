import { apiFetch } from "@/api/base"

export type LoginResult =
  | { success: true; access_token: string; refresh_token: string; user_id: number }
  // 2FA challenge (FR-4): password verified, but a code was emailed and must
  // be exchanged (with the challenge token) before tokens are issued.
  | { success: false; two_factor_required: true; two_factor_token: string; message: string }
  | { success: false; two_factor_required?: false; error: string }

export async function loginUser(data: { email: string; password: string }): Promise<LoginResult> {
  try {                                        // ✅ wrap everything
    const res = await apiFetch(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) },
      true
    )
    if (res.two_factor_required) {
      return {
        success: false,
        two_factor_required: true,
        two_factor_token: res.two_factor_token,
        message: res.message ?? "A verification code was sent to your email.",
      }
    }
    return { success: true, access_token: res.access_token, refresh_token: res.refresh_token, user_id: res.user_id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed. Please try again."
    return { success: false, error: message }  // ✅ return, never throw
  }
}

export type Verify2faResult =
  | { success: true; access_token: string; refresh_token: string; user_id: number }
  | { success: false; error: string }

export async function verifyTwoFactor(data: { two_factor_token: string; code: string }): Promise<Verify2faResult> {
  try {
    const res = await apiFetch(
      "/auth/login/verify-2fa",
      { method: "POST", body: JSON.stringify(data) },
      true
    )
    return { success: true, access_token: res.access_token, refresh_token: res.refresh_token, user_id: res.user_id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed. Please try again."
    return { success: false, error: message }
  }
}

export async function resendTwoFactor(two_factor_token: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiFetch(
      "/auth/login/resend-2fa",
      { method: "POST", body: JSON.stringify({ two_factor_token }) },
      true
    )
    return { success: true, message: res.message ?? "A new code was sent." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not resend the code."
    return { success: false, message }
  }
}

/** Self-service 2FA toggle (settings page). Requires the current password. */
export async function setTwoFactor(data: { enabled: boolean; current_password: string }): Promise<
  { success: true; two_factor_enabled: boolean; reauth_required: boolean } | { success: false; error: string }
> {
  try {
    const res = await apiFetch("/auth/me/two-factor", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return { success: true, two_factor_enabled: res.two_factor_enabled, reauth_required: res.reauth_required }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update two-factor authentication."
    return { success: false, error: message }
  }
}

export type RegisterResult =
  | { success: true; message: string; id: number }
  | { success: false; error: string }

export interface RegisterFormData {
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  role: string
  password: string
}



export async function registerUser(data: RegisterFormData): Promise<RegisterResult> {
  try {
    const res = await apiFetch(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data) },
      true
    )
    return { success: true, message: "Registration successful", id: res.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed. Please try again."
    return { success: false, error: message }
  }
}

export async function createResearcherRequest(userId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await apiFetch(
      "/auth/researcher-requests",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      },
      true
    )
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create researcher request."
    return { success: false, error: message }
  }
}

export type AuthActionResult =
  | { success: true; message: string }
  | { success: false; error: string }

export async function requestPasswordReset(email: string): Promise<AuthActionResult> {
  try {
    const res = await apiFetch(
      "/auth/forgot-password",
      { method: "POST", body: JSON.stringify({ email }) },
      true
    )
    return { success: true, message: res?.message ?? "If an account with that email exists, a verification code has been sent." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send verification code. Please try again."
    return { success: false, error: message }
  }
}

export async function verifyPasswordResetOtp(email: string, otp: string): Promise<AuthActionResult> {
  try {
    const res = await apiFetch(
      "/auth/verify-otp",
      { method: "POST", body: JSON.stringify({ email, otp }) },
      true
    )
    return { success: true, message: res?.message ?? "OTP verified successfully." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid or expired OTP"
    return { success: false, error: message }
  }
}

export async function resetPassword(
  email: string,
  otp: string,
  new_password: string
): Promise<AuthActionResult> {
  try {
    const res = await apiFetch(
      "/auth/reset-password",
      { method: "POST", body: JSON.stringify({ email, otp, new_password }) },
      true
    )
    return { success: true, message: res?.message ?? "Password reset successfully." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reset password. Please try again."
    return { success: false, error: message }
  }
}

export async function updateResearcherRequestStatus(
  requestId: number,
  status: "approved" | "declined"
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiFetch(
      `/auth/researcher-requests/${requestId}/status?status=${status}`,
      { method: "PATCH" }
    )
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update request status."
    return { success: false, error: message }
  }
}
