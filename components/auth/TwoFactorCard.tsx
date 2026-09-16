"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useCurrentUser, useSecuritySettings, useSetTwoFactor } from "@/hooks/authentication";
import { useAuthStore } from "@/store/authStore";

const inputClass =
  "w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md";

// Per-user email-OTP 2FA — every role can turn it on or off here (admin
// accounts are seeded ON at migration, but nothing is forced). Enabling
// invalidates the current session, so the user is signed out to re-login
// through the code challenge.
export default function TwoFactorCard() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const setTwoFactor = useSetTwoFactor();
  const logout = useAuthStore((s) => s.logout);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: security } = useSecuritySettings();
  const globallyOff = security?.two_factor_login_enabled === false;

  const enabled = Boolean(user?.two_factor_enabled);

  const toggle = () => {
    setError(null);
    if (!password) {
      setError("Enter your current password to change this setting.");
      return;
    }
    setTwoFactor.mutate(
      { enabled: !enabled, current_password: password },
      {
        onSuccess: (res) => {
          setPassword("");
          if (!res.success) {
            setError(res.error);
            return;
          }
          if (res.reauth_required) {
            setNotice("Two-factor enabled. Please sign in again.");
            setTimeout(() => {
              logout();
              router.replace("/login");
            }, 1500);
          } else {
            setNotice(res.two_factor_enabled
              ? "Two-factor authentication is on."
              : "Two-factor authentication is off.");
          }
        },
      }
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-primary" />
        <h2 className="text-sm font-semibold text-gray-800">Two-factor authentication</h2>
        <span className={`ml-auto text-xs font-semibold rounded-full px-2.5 py-0.5 ${
          enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
        }`}>
          {enabled ? "On" : "Off"}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        A 6-digit code is emailed to you at every sign-in. Confirm your password
        to turn it {enabled ? "off" : "on"}.
      </p>
      {globallyOff && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Sign-in codes are currently turned off for the whole app by an
          administrator — your setting is saved but won&apos;t apply until they
          are turned back on.
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
          className={`${inputClass} sm:w-64`}
        />
        <button
          type="button"
          onClick={toggle}
          disabled={setTwoFactor.isPending}
          className="rounded-md border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 w-fit"
        >
          {setTwoFactor.isPending ? "Saving…" : enabled ? "Turn off" : "Turn on"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {notice && <p className="text-xs text-green-600">{notice}</p>}
    </div>
  );
}
