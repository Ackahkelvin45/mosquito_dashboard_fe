"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Public self-signup has been removed — accounts are created by an
// administrator (super admin, or a cluster admin for their own cluster).
// Anyone landing here is sent to the login page.
export default function SignupRemovedPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <div className="w-full h-screen flex items-center justify-center font-raleway px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold text-gray-900">Accounts are created by an administrator</h1>
        <p className="mt-2 text-sm text-gray-500">
          Please contact your administrator to get an account. Redirecting you to sign in…
        </p>
      </div>
    </div>
  )
}
