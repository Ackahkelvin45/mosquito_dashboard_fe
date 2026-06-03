"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_TIMEOUT = 60_000; // inactivity before the warning shows (ms)
const DEFAULT_COUNTDOWN = 60_000; // grace period before auto-logout (ms)
const ACTIVITY_THROTTLE = 500; // ignore repeated activity within this window (ms)

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "wheel",
  "touchstart",
  "touchmove",
  "click",
] as const;

function readEnvInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

interface InactivityTimeoutProps {
  /** Idle time before the warning overlay appears (ms). Defaults to NEXT_PUBLIC_INACTIVITY_TIMEOUT. */
  timeout?: number;
  /** Countdown grace period before logout (ms). Defaults to NEXT_PUBLIC_INACTIVITY_COUNTDOWN. */
  countdown?: number;
}

export default function InactivityTimeout({ timeout, countdown }: InactivityTimeoutProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);

  const idleMs = timeout ?? readEnvInt(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT, DEFAULT_TIMEOUT);
  const graceMs = countdown ?? readEnvInt(process.env.NEXT_PUBLIC_INACTIVITY_COUNTDOWN, DEFAULT_COUNTDOWN);

  const [warning, setWarning] = useState(false);
  const [remaining, setRemaining] = useState(graceMs);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const warningRef = useRef(false);
  const lastActivityRef = useRef(0);

  const stopCountdown = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(() => {
    stopCountdown();
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    warningRef.current = false;
    setWarning(false);
    logout();
    router.replace("/login");
  }, [logout, router, stopCountdown]);

  const startCountdown = useCallback(() => {
    warningRef.current = true;
    setWarning(true);
    setRemaining(graceMs);

    const end = Date.now() + graceMs;
    const tick = () => {
      const left = end - Date.now();
      if (left <= 0) {
        setRemaining(0);
        handleLogout();
        return;
      }
      setRemaining(left);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [graceMs, handleLogout]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(startCountdown, idleMs);
  }, [idleMs, startCountdown]);

  // Dismiss the warning and restart the idle timer (user is active again).
  const dismissAndReset = useCallback(() => {
    if (warningRef.current) {
      warningRef.current = false;
      setWarning(false);
      stopCountdown();
    }
    resetIdleTimer();
  }, [resetIdleTimer, stopCountdown]);

  useEffect(() => {
    // Only guard authenticated sessions.
    if (!accessToken) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      stopCountdown();
      return;
    }

    const handleActivity = () => {
      // While the warning is up, respond to any activity immediately.
      if (warningRef.current) {
        dismissAndReset();
        return;
      }
      // Otherwise throttle to avoid resetting the timer on every mousemove frame.
      const now = Date.now();
      if (now - lastActivityRef.current < ACTIVITY_THROTTLE) return;
      lastActivityRef.current = now;
      resetIdleTimer();
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    resetIdleTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      stopCountdown();
    };
  }, [accessToken, dismissAndReset, resetIdleTimer, stopCountdown]);

  if (!warning) return null;

  const seconds = Math.ceil(remaining / 1000);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Session inactivity warning"
      className="inactivity-overlay fixed inset-0 z-9999 flex items-center justify-center p-4"
    >
      {/* Blurred, gradient backdrop */}
      <div className="absolute inset-0 backdrop-blur-md bg-linear-to-br from-slate-900/70 via-primary/40 to-secondary/50" />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl px-6 py-8 sm:px-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ShieldAlert size={24} />
        </div>

        <h2 className="font-raleway text-xl font-bold text-gray-900">
          Are you still there?
        </h2>
        <p className="mt-2 text-sm text-gray-500 font-raleway">
        you will be signed out due to inactivity.
        </p>

        {/* Circular countdown */}
        <div className="relative mx-auto my-7 h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="inactivityRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3C2178" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              className="countdown-ring"
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#inactivityRing)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={
                {
                  "--ring-duration": `${graceMs}ms`,
                  "--ring-circumference": circumference,
                } as React.CSSProperties
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mulish text-4xl font-extrabold text-gray-900 tabular-nums">
              {seconds}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              seconds
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 font-raleway"
          >
            Log out now
          </button>
          <button
            type="button"
            onClick={dismissAndReset}
            className="flex-1 rounded-xl bg-linear-to-r from-secondary to-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 font-raleway"
          >
            Stay logged in
          </button>
        </div>
      </div>

      <style jsx>{`
        .inactivity-overlay {
          animation: fadeIn 200ms ease-out;
        }
        /* The ring depletes smoothly over the full countdown, like a clock hand. */
        .countdown-ring {
          animation: ring-deplete var(--ring-duration, 15000ms) linear forwards;
        }
        @keyframes ring-deplete {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: var(--ring-circumference);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
