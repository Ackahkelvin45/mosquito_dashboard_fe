"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import logo from "../../public/images/logo.png"
import name from "../../public/images/name.png"
import loginiage from "../../public/images/loginimage.png"
import { useSignup } from "@/hooks/authentication"
import { createResearcherRequest } from "@/actions/authentication/authenticationMutation"

export default function SignupPage() {
  const router = useRouter()
  const { mutate: signup, isPending, isError, error } = useSignup()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [requestToBeResearcher, setRequestToBeResearcher] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError(null)

    if (password !== confirmPassword) {
      setSignupError("Passwords do not match.")
      return
    }

    signup(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        is_active: true,
        role: requestToBeResearcher ? "ADMIN" : "USER"
      },
      {
        onSuccess: async (data) => {
          if (data.success) {
            // If user checked researcher request, do it now
            if (requestToBeResearcher) {
              await createResearcherRequest(data.id)
            }
            
            setSignupSuccess(true)
            setTimeout(() => {
              router.push("/login")
            }, 2000)
          } else {
            setSignupError(data.error)
          }
        },
        onError: () => {
          setSignupError("Something went wrong. Please try again.")
        },
      }
    )
  }

  return (
    <div className="w-full h-screen  flex flex-row">
      <div className="w-full md:w-1/2 h-full flex  justify-center bg-[#F5F5F5] items-center py-10">
        <div className=" w-full  h-full justify-center items-center flex flex-col px-6">
          <div className="flex flex-row justify-center gap-2 items-center">
            <div>
              <Image src={logo} alt="logo" width={50} height={50} />
            </div>
            <div className="flex justify-center items-center">
              <Image src={name} alt="name" width={200} height={200} />
            </div>
          </div>

          <div className="w-full font-raleway text-lg my-5 font-medium text-text-dark text-center">
            Real-Time Mosquito & Environmental Surveillance
          </div>

          {signupSuccess && (
            <div
              className="flex items-center p-4 mb-4 text-sm bg-[#ecfdf5] text-[#065f46] border-t-4 border-[#34d399]"
              role="alert"
            >
              <svg className="w-4 h-4 shrink-0 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
              </svg>
              <div>Account created successfully! Redirecting to login...</div>
            </div>
          )}

          {(signupError || isError) && (
            <div
              id="alert-border-2"
              className="flex sm:items-center p-4 mb-4 text-sm border-t-4 bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"
              role="alert"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5 md:mt-0 text-[#991b1b]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
              <span className="sr-only">Info</span>
              <div className="ms-2 text-sm flex-1">
                {signupError ?? (error instanceof Error ? error.message : "Signup failed. Please try again.")}
              </div>
              <button
                type="button"
                className="ms-auto -mx-1.5 -my-1.5 rounded p-1.5 inline-flex items-center justify-center h-8 w-8 shrink-0 bg-[#fef2f2] text-[#991b1b] hover:bg-[#fecaca] focus:ring-2 focus:ring-[#f87171] focus:outline-none"
                onClick={() => setSignupError(null)}
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col  gap-4 font-raleway mt-4">
            <div className="flex flex-row gap-4">
              <div className="w-1/2 ">
                <label htmlFor="first_name" className="text-dark text-sm mb-2 font-medium block">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="last_name" className="text-dark text-sm mb-2 font-medium block">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
                />
              </div>
            </div>

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

            <div>
              <label htmlFor="confirmPassword" className="text-dark text-sm mb-2 font-medium block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="***************"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 pr-10 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff strokeWidth={1.5} size={18} />
                  ) : (
                    <Eye strokeWidth={1.5} size={18} />
                  )}
                </button>
              </div>
            </div>

        <div className="flex justify-end text-primary mt-2  text-sm font-medium flex-row gap-2">
          <input
            type="checkbox"
            id="researcher_request"
            checked={requestToBeResearcher}
            onChange={(e) => setRequestToBeResearcher(e.target.checked)}
          />
          <label htmlFor="researcher_request" className="cursor-pointer">
            Request to be a researcher
          </label>



          
        </div>


            <div className="mt-8 w-full">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-3 flex items-center justify-center gap-5 bg-linear-to-r from-secondary to-primary font-semibold text-white text-sm rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <div className="spinner1"></div>
                ) : (
                  <div className="ml-2">Signup</div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 w-full font-raleway flex justify-center gap-1 text-sm font-medium">
            <span className="text-gray-500">Already have an account?</span>
            <Link href="/login" className="text-secondary hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 h-full fixed right-0 top-0 bottom-0">
        <Image src={loginiage} alt="signup" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}