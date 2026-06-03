"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react"
import logo from "../../public/images/logo.png"
import name from "../../public/images/name.png"
import loginimage from "../../public/images/loginimage.png"
import {
  useRequestPasswordReset,
  useVerifyPasswordResetOtp,
  useResetPassword,
} from "@/hooks/authentication"

type Step = "email" | "otp" | "password" | "done"

// Mirrors the registration policy: >=8 chars, at least one letter, one number, one uppercase.
function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters."
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter."
  if (!/[0-9]/.test(password)) return "Password must contain at least one number."
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter."
  return null
}

function Alert({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      className="flex sm:items-center p-4 mb-4 text-sm border-t-4 bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
      role="alert"
    >
      <svg className="w-4 h-4 shrink-0 mt-0.5 md:mt-0 text-[#991b1b]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
      <div className="ms-2 text-sm flex-1">{message}</div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 rounded p-1.5 inline-flex items-center justify-center h-8 w-8 shrink-0 bg-[#fef2f2] text-[#991b1b] hover:bg-[#fecaca] focus:ring-2 focus:ring-[#f87171] focus:outline-none"
        onClick={onClose}
        aria-label="Close"
      >
        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" /></svg>
      </button>
    </div>
  )
}

const inputClass =
  "w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
const buttonClass =
  "w-full py-2.5 px-3 flex items-center justify-center gap-3 bg-linear-to-r from-secondary to-primary font-semibold text-white text-sm rounded-md disabled:opacity-70 disabled:cursor-not-allowed"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const requestReset = useRequestPasswordReset()
  const verifyOtp = useVerifyPasswordResetOtp()
  const reset = useResetPassword()

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    requestReset.mutate(email, {
      onSuccess: (res) => {
        if (res.success) {
          setNotice(res.message)
          setStep("otp")
        } else {
          setError(res.error)
        }
      },
      onError: () => setError("Something went wrong. Please try again."),
    })
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.")
      return
    }
    verifyOtp.mutate(
      { email, otp },
      {
        onSuccess: (res) => {
          if (res.success) {
            setNotice(null)
            setStep("password")
          } else {
            setError(res.error)
          }
        },
        onError: () => setError("Something went wrong. Please try again."),
      }
    )
  }

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const policyError = validatePassword(password)
    if (policyError) {
      setError(policyError)
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    reset.mutate(
      { email, otp, new_password: password },
      {
        onSuccess: (res) => {
          if (res.success) {
            setStep("done")
          } else {
            setError(res.error)
          }
        },
        onError: () => setError("Something went wrong. Please try again."),
      }
    )
  }

  const handleResend = () => {
    setError(null)
    requestReset.mutate(email, {
      onSuccess: (res) => setNotice(res.success ? "A new code has been sent." : null),
      onError: () => setError("Failed to resend code."),
    })
  }

  return (
    <div className="w-full h-screen flex flex-row">
      <div className="w-full lg:w-1/2 h-full flex justify-center bg-[#F5F5F5] items-center px-6">
        <div className="w-full max-w-md flex flex-col">
          <div className="flex flex-row justify-center gap-2 items-center">
            <Image src={logo} alt="logo" width={50} height={50} />
            <div className="flex justify-center items-center">
              <Image src={name} alt="name" width={200} height={200} />
            </div>
          </div>

          <div className="w-full font-raleway text-lg my-5 font-medium text-text-dark text-center">
            Reset your password
          </div>

          {error && <Alert message={error} onClose={() => setError(null)} />}
          {notice && step !== "done" && (
            <div className="p-3 mb-4 text-sm rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              {notice}
            </div>
          )}

          {/* Step 1 — email */}
          {step === "email" && (
            <form onSubmit={handleRequest} className="flex flex-col gap-4 font-raleway mt-2">
              <p className="text-sm text-gray-500 -mt-1">
                Enter your account email and we&apos;ll send you a 6-digit verification code.
              </p>
              <div>
                <label htmlFor="email" className="text-dark text-sm mb-2 font-medium block">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={requestReset.isPending} className={`${buttonClass} mt-4`}>
                {requestReset.isPending ? <div className="spinner1" /> : "Send Code"}
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerify} className="flex flex-col gap-4 font-raleway mt-2">
              <p className="text-sm text-gray-500 -mt-1">
                Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>. It expires in 10 minutes.
              </p>
              <div>
                <label htmlFor="otp" className="text-dark text-sm mb-2 font-medium block">Verification Code</label>
                <input
                  type="text"
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  className={`${inputClass} tracking-[0.5em] text-center text-lg`}
                />
              </div>
              <button type="submit" disabled={verifyOtp.isPending} className={`${buttonClass} mt-4`}>
                {verifyOtp.isPending ? <div className="spinner1" /> : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={requestReset.isPending}
                className="text-secondary hover:underline text-sm font-medium self-center disabled:opacity-60"
              >
                Resend code
              </button>
            </form>
          )}

          {/* Step 3 — new password */}
          {step === "password" && (
            <form onSubmit={handleReset} className="flex flex-col gap-4 font-raleway mt-2">
              <div>
                <label htmlFor="password" className="text-dark text-sm mb-2 font-medium block">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="***************"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff strokeWidth={1.5} size={18} /> : <Eye strokeWidth={1.5} size={18} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  At least 8 characters, one uppercase letter and one number.
                </p>
              </div>
              <div>
                <label htmlFor="confirm" className="text-dark text-sm mb-2 font-medium block">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirm"
                  placeholder="***************"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={reset.isPending} className={`${buttonClass} mt-4`}>
                {reset.isPending ? <div className="spinner1" /> : "Reset Password"}
              </button>
            </form>
          )}

          {/* Step 4 — done */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 mt-2 font-raleway">
              <CheckCircle2 size={48} className="text-green-500" />
              <p className="text-sm text-gray-600 text-center">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button type="button" onClick={() => router.push("/login")} className={buttonClass}>
                Back to Login
              </button>
            </div>
          )}

          {step !== "done" && (
            <div className="mt-6 w-full font-raleway flex justify-center">
              <Link href="/login" className="text-secondary hover:underline text-sm font-medium flex items-center gap-1">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 h-full">
        <Image src={loginimage} alt="login" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
