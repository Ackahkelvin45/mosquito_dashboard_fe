import { apiFetch } from "@/api/base"

export type UserRoleValue = "USER" | "ADMIN" | "SUPER_ADMIN"

export type CreateUserPayload = {
  first_name: string
  last_name: string
  email: string
  password: string
  role: UserRoleValue
  cluster_id?: number
}

export type CreateUserResult =
  | { success: true; id: number }
  | { success: false; error: string }

export async function createUser(data: CreateUserPayload): Promise<CreateUserResult> {
  try {
    // Reuses the existing registration endpoint, which accepts role + cluster_id.
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return { success: true, id: res.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create user. Please try again."
    return { success: false, error: message }
  }
}

export type UpdateUserPayload = {
  first_name?: string
  last_name?: string
  email?: string
  role?: UserRoleValue
  cluster_id?: number | null
  is_active?: boolean
}

export type UpdateUserResult =
  | { success: true }
  | { success: false; error: string }

export async function updateUser(userId: number | string, data: UpdateUserPayload): Promise<UpdateUserResult> {
  try {
    await apiFetch(`/auth/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update user. Please try again."
    return { success: false, error: message }
  }
}
