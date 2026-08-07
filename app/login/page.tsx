"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import logo from "../../public/images/logo.png"
import name from "../../public/images/name.png"
import loginiage from "../../public/images/loginimage.png"
import { useLogin } from "@/hooks/authentication"
import { useAuthStore } from "@/store/authStore"

export default function LoginPage() {
  const router = useRouter()
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode)
  const { mutate: login, isPending, isError, error } = useLogin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    login(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.success) {
            router.push("/")
          } else {
            setLoginError(data.error)
          }
        },
        onError: () => {
          setLoginError("Something went wrong. Please try again.")
        },
      }
    )
  }

  return (
    <div className="w-full min-h-dvh flex flex-row">
      <div className="w-full lg:w-1/2 min-h-dvh flex justify-center bg-[#F5F5F5] items-center px-6 py-10">
        <div className="w-full max-w-md flex flex-col">
          <div className="flex flex-row justify-center gap-2 items-center">
            <div>
              <Image src={logo} alt="logo" width={50} height={40} className="h-auto" />
            </div>
            <div className="flex justify-center items-center">
              <Image src={name} alt="name" width={200} height={28} className="w-40 sm:w-[200px] h-auto" />
            </div>
          </div>

          <div className="w-full font-raleway text-lg my-5 font-medium text-text-dark text-center">
            Real-Time Mosquito & Environmental Surveillance
          </div>


{(loginError || isError) && (
        <div
          id="alert-border-2"
          className="flex sm:items-center p-4 mb-4 text-sm border-t-4  bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
          role="alert"
        >
          <svg className="w-4 h-4 shrink-0 mt-0.5 md:mt-0 text-[#991b1b]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          <span className="sr-only">Info</span>
          <div className="ms-2 text-sm flex-1">
            {loginError ?? (error instanceof Error ? error.message : "Login failed. Please try again.")}
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 rounded p-1.5 inline-flex items-center justify-center h-8 w-8 shrink-0 bg-[#fef2f2] text-[#991b1b] hover:bg-[#fecaca] focus:ring-2 focus:ring-[#f87171] focus:outline-none"
            onClick={() => setLoginError(null)}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
          </button>
        </div>
      )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-raleway mt-4">
            <div>
              <label htmlFor="email" className="text-dark text-sm mb-2 font-medium block">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-dark text-sm mb-2 font-medium block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="***************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 pr-10 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2 -m-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff strokeWidth={1.5} size={18} />
                  ) : (
                    <Eye strokeWidth={1.5} size={18} />
                  )}
                </button>
              </div>
            </div>


            <div className="mt-8 w-full">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-3 flex items-center justify-center gap-5 bg-linear-to-r from-secondary to-primary font-semibold text-white text-sm rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
              >

{
    isPending ? (
    
        <div className="spinner1"></div>

    ) : (
        <div className="ml-2">
            {isPending ? "Signing in..." : "Login"}
        </div>
    )
}
              </button>
            </div>
          </form>

          {/* Explore without an account: read-only access to public data. */}
          <div className="mt-4 w-full font-raleway flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>
          <button
            type="button"
            onClick={() => {
              enterGuestMode()
              router.push("/")
            }}
            className="mt-4 w-full py-2.5 px-3 font-raleway border border-primary text-primary font-semibold text-sm rounded-md hover:bg-primary/5 transition-colors"
          >
            View as Guest
          </button>
          <p className="mt-2 text-center font-raleway text-xs text-gray-400">
            Read-only access to public surveillance data — no account needed.
          </p>

          {/* Self-signup removed — accounts are created by an administrator. */}
          <div className="mt-4 w-full font-raleway flex flex-col items-center gap-2">
            <Link href="/forgot-password" className="text-secondary hover:underline text-sm font-medium">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        <Image src={loginiage} alt="login" fill sizes="50vw" className="object-cover" />
      </div>
    </div>
  )
}
