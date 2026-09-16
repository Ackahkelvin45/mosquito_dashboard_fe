"use client";

import React from "react";
import GlobalTwoFactorCard from "@/components/auth/GlobalTwoFactorCard";
import TwoFactorCard from "@/components/auth/TwoFactorCard";
import NotificationPreferencesCard from "@/components/notifications/NotificationPreferences";
import AlertSettingsCard from "@/components/notifications/AlertSettingsCard";

// Settings = sign-in security (per-user 2FA) + how the system talks to you
// (and, for super admins, when it alerts everyone). Identity and password
// live on /profile.
export default function SettingsPage() {
  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your sign-in security, which alerts you receive and how they reach you.
        </p>
      </div>

      {/* SUPER_ADMIN only — renders null for everyone else */}
      <GlobalTwoFactorCard />

      <TwoFactorCard />

      <NotificationPreferencesCard />

      {/* SUPER_ADMIN only — renders null for everyone else */}
      <AlertSettingsCard />
    </div>
  );
}
