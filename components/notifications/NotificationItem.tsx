"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  BatteryLow,
  Boxes,
  Bug,
  Cpu,
  Droplets,
  FlaskConical,
  Settings2,
  Thermometer,
  UserPlus,
  UserRound,
  WifiOff,
} from "lucide-react";
import { timeAgo } from "@/lib/date";
import type {
  Notification,
  NotificationCategory,
  NotificationSeverity,
} from "@/queries/notification/notificationQueries";

// Pre-rendered elements (Sidebar navItems pattern) — keeps icon selection a
// plain lookup instead of creating component references during render.
const CATEGORY_ICONS: Record<NotificationCategory, React.ReactNode> = {
  MOSQUITO: <Bug size={16} strokeWidth={2} />,
  SENSOR: <Activity size={16} strokeWidth={2} />,
  DEVICE: <Cpu size={16} strokeWidth={2} />,
  ACCOUNT: <UserRound size={16} strokeWidth={2} />,
  RESEARCH: <FlaskConical size={16} strokeWidth={2} />,
  CLUSTER: <Boxes size={16} strokeWidth={2} />,
  SYSTEM: <Settings2 size={16} strokeWidth={2} />,
};

// Icon hints the backend sends on `notification.icon`; anything unknown falls
// back to the category icon.
const ICON_HINTS: Record<string, React.ReactNode> = {
  bug: <Bug size={16} strokeWidth={2} />,
  "battery-low": <BatteryLow size={16} strokeWidth={2} />,
  "wifi-off": <WifiOff size={16} strokeWidth={2} />,
  thermometer: <Thermometer size={16} strokeWidth={2} />,
  droplets: <Droplets size={16} strokeWidth={2} />,
  "user-plus": <UserPlus size={16} strokeWidth={2} />,
  "flask-conical": <FlaskConical size={16} strokeWidth={2} />,
  boxes: <Boxes size={16} strokeWidth={2} />,
  "alert-triangle": <AlertTriangle size={16} strokeWidth={2} />,
};

const SEVERITY_CLASSES: Record<NotificationSeverity, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  WARNING: "bg-amber-100 text-amber-700",
  SUCCESS: "bg-green-100 text-green-700",
  INFO: "bg-primary/10 text-primary",
};

const SEVERITY_LABELS: Record<NotificationSeverity, string> = {
  CRITICAL: "Critical",
  WARNING: "Warning",
  SUCCESS: "Success",
  INFO: "Info",
};

function resolveIcon(notification: Notification): React.ReactNode {
  if (notification.icon && ICON_HINTS[notification.icon]) {
    return ICON_HINTS[notification.icon];
  }
  return CATEGORY_ICONS[notification.category] ?? CATEGORY_ICONS.SYSTEM;
}

interface NotificationItemProps {
  notification: Notification;
  /** Tight layout for the bell dropdown (no severity pill). */
  compact?: boolean;
  onClick?: () => void;
  /** Row actions (page only); rendered right-aligned, revealed on hover. */
  actions?: React.ReactNode;
}

export default function NotificationItem({
  notification,
  compact = false,
  onClick,
  actions,
}: NotificationItemProps) {
  const icon = resolveIcon(notification);
  const unread = !notification.read_at;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group flex items-start gap-3 font-raleway transition-colors
        ${compact ? "px-4 py-3" : "px-4 py-4 sm:px-5"}
        ${unread ? "bg-primary/5" : "bg-white"}
        ${onClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
    >
      <div
        title={notification.category}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${SEVERITY_CLASSES[notification.severity]}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={`text-sm text-gray-900 flex-1 min-w-0 ${
              unread ? "font-semibold" : "font-medium"
            }`}
          >
            {notification.title || "—"}
          </p>
          {!compact && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${SEVERITY_CLASSES[notification.severity]}`}
            >
              {SEVERITY_LABELS[notification.severity]}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
          {notification.body || "—"}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400 font-mulish">
            {timeAgo(notification.created_at)}
          </span>
          {unread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />}
          {!compact && notification.archived_at && (
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Archived
            </span>
          )}
        </div>
      </div>

      {actions}
    </div>
  );
}
