"use client";

import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useSecuritySettings, useSetSecuritySettings } from "@/hooks/authentication";
import { useRole } from "@/hooks/useRole";

// SUPER_ADMIN master switch: turns the email-code sign-in requirement on or
// off for the WHOLE app. Off = nobody is challenged; everyone's personal
// preference is kept and applies again when re-enabled. Renders null for
// everyone else.
export default function GlobalTwoFactorCard() {
  const { canManageSystem } = useRole();
  const { data, isLoading } = useSecuritySettings();
  const setSettings = useSetSecuritySettings();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!canManageSystem) return null;

  const enabled = Boolean(data?.two_factor_login_enabled);

  const toggle = () => {
    setError(null);
    setNotice(null);
    setSettings.mutate(
      { two_factor_login_enabled: !enabled },
      {
        onSuccess: (res) => {
          if (!res.success) {
            setError(res.error);
            return;
          }
          setNotice(res.two_factor_login_enabled
            ? "Sign-in codes are ON for the whole app — users' personal settings now apply."
            : "Sign-in codes are OFF for the whole app — nobody will be asked for a code.");
        },
      }
    );
  };

  return (
    <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} className="text-amber-600" />
        <h2 className="text-sm font-semibold text-gray-800">
          Sign-in codes — whole app
        </h2>
        <span className={`ml-auto text-xs font-semibold rounded-full px-2.5 py-0.5 ${
          enabled ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
        }`}>
          {isLoading ? "…" : enabled ? "On" : "Off"}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        Master switch for two-factor sign-in across the entire dashboard. When off,
        no one is asked for an email code — each user&apos;s own preference is kept and
        takes effect again when you turn this back on. Only super admins see this.
      </p>
      <button
        type="button"
        onClick={toggle}
        disabled={setSettings.isPending || isLoading}
        className="rounded-md border border-amber-300 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50 w-fit"
      >
        {setSettings.isPending ? "Saving…" : enabled ? "Turn off for everyone" : "Turn on for everyone"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {notice && <p className="text-xs text-green-600">{notice}</p>}
    </div>
  );
}
