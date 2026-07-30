"use client";

import React, { useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNotificationPreferences, useUpdatePreferences } from "@/hooks/notification";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import type { NotificationPreferences } from "@/queries/notification/notificationQueries";

type PreferenceKey = keyof NotificationPreferences;

const ALERT_ROWS: { key: PreferenceKey; label: string; description: string }[] = [
  { key: "species_alerts", label: "Species alerts", description: "Vector or dangerous mosquito species detections." },
  { key: "battery_alerts", label: "Battery alerts", description: "Low battery warnings from devices." },
  { key: "offline_alerts", label: "Offline alerts", description: "Devices going offline or coming back online." },
  { key: "admin_alerts", label: "Admin alerts", description: "Registrations, approvals and system events." },
  { key: "researcher_alerts", label: "Researcher alerts", description: "Researcher request submissions and decisions." },
];

const CHANNEL_ROWS: { key: PreferenceKey; label: string; description: string }[] = [
  { key: "in_app_enabled", label: "In-app", description: "Show notifications inside the dashboard." },
  { key: "push_enabled", label: "Push", description: "Browser push notifications on this device." },
  { key: "email_enabled", label: "Email", description: "Send notifications to your email address." },
];

function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group relative w-10 h-6 shrink-0 rounded-full transition-colors bg-gray-300 aria-checked:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span
        aria-hidden
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform group-aria-checked:translate-x-4"
      />
    </button>
  );
}

function PreferenceRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  message,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  message?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        {message && <p className="text-xs text-amber-600 mt-1">{message}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} label={label} />
    </div>
  );
}

export default function NotificationPreferencesCard() {
  const { data: preferences, isLoading, isError } = useNotificationPreferences();
  const updatePreferences = useUpdatePreferences();
  const push = usePushSubscription();

  // "Saved" hint that fades away after a successful save.
  const [showSaved, setShowSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const flashSaved = () => {
    setShowSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setShowSaved(false), 2000);
  };

  const save = (patch: Partial<NotificationPreferences>) => {
    updatePreferences.mutate(patch, { onSuccess: flashSaved });
  };

  const handleToggle = (key: PreferenceKey, next: boolean) => {
    if (key === "push_enabled") {
      if (next) {
        // Only persist the preference once the browser subscription succeeds;
        // otherwise the hook's inline error explains what went wrong.
        void push.subscribe().then((ok) => {
          if (ok) save({ push_enabled: true });
        });
      } else {
        void push.unsubscribe().then(() => save({ push_enabled: false }));
      }
      return;
    }
    save({ [key]: next });
  };

  const pushMessage = !push.supported
    ? "Push notifications are not supported in this browser."
    : push.error
      ? push.error
      : push.permission === "denied"
        ? "Notifications are blocked in your browser settings."
        : null;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 font-raleway">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Notification Preferences
        </h3>
        <span
          aria-live="polite"
          className={`text-xs font-semibold text-green-600 transition-opacity duration-500 ${
            showSaved ? "opacity-100" : "opacity-0"
          }`}
        >
          Saved
        </span>
      </div>

      {isError ? (
        <p className="text-center text-sm text-gray-400 py-8">
          Couldn&apos;t load your preferences. Please try again.
        </p>
      ) : isLoading || !preferences ? (
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={20} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-4 mb-1">
              Alert types
            </p>
            {ALERT_ROWS.map((row) => (
              <PreferenceRow
                key={row.key}
                label={row.label}
                description={row.description}
                checked={preferences[row.key]}
                onChange={(next) => handleToggle(row.key, next)}
                disabled={updatePreferences.isPending}
              />
            ))}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-4 mb-1">
              Channels
            </p>
            {CHANNEL_ROWS.map((row) => (
              <PreferenceRow
                key={row.key}
                label={row.label}
                description={row.description}
                checked={preferences[row.key]}
                onChange={(next) => handleToggle(row.key, next)}
                disabled={
                  updatePreferences.isPending ||
                  (row.key === "push_enabled" && (push.loading || !push.supported))
                }
                message={row.key === "push_enabled" ? pushMessage : null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
