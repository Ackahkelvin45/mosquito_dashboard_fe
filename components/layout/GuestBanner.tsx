"use client"

import Link from "next/link"
import { Eye, LogIn } from "lucide-react"

/**
 * Persistent banner shown on every page while browsing as a guest: makes the
 * read-only state obvious and offers a one-click path to sign in.
 */
export default function GuestBanner() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 font-raleway">
      <div className="flex items-center gap-2 text-sm text-amber-800">
        <Eye size={16} className="shrink-0" />
        <span>
          <span className="font-semibold">Guest Mode</span>
          <span className="hidden sm:inline">
            {" "}— you are viewing public data in read-only mode.
          </span>
        </span>
      </div>
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
      >
        <LogIn size={14} />
        Sign In
      </Link>
    </div>
  )
}
