"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from "@/hooks/notification";
import { safeUrl } from "@/lib/url";
import type { Notification } from "@/queries/notification/notificationQueries";

const DROPDOWN_PAGE_SIZE = 10;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  // Only fetch the list while the dropdown is open; the badge polling above
  // keeps the count live on its own.
  const { data, isLoading } = useNotifications(
    { page: 1, page_size: DROPDOWN_PAGE_SIZE },
    { sort: "newest" },
    { enabled: open }
  );
  const items: Notification[] = data?.items ?? [];

  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  // Close on route change (render-phase adjustment — no effect needed).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  // Close the dropdown when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onMouseDown);
    return () => document.removeEventListener("pointerdown", onMouseDown);
  }, [open]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleItemClick = (notification: Notification) => {
    if (!notification.read_at) markRead.mutate(notification.id);
    setOpen(false);
    router.push(safeUrl(notification.action_url));
  };

  return (
    <div ref={containerRef} className="relative shrink-0 px-2 sm:px-4 font-raleway">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        className="relative p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 19.5455C8.6586 21.0273 10.3784 22 12 22C13.6216 22 15.3414 21.0273 16 19.5455M18 11.1902V8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8V11.1902C6 12.0239 5.64615 12.8185 5.02647 13.3762L3.91854 14.3733C2.59604 15.5636 3.01797 17.7338 4.69009 18.3419L4.90109 18.4186C9.48681 20.0861 14.5132 20.0861 19.0989 18.4186L19.3099 18.3419C20.982 17.7338 21.404 15.5636 20.0815 14.3733L18.9735 13.3762C18.3539 12.8185 18 12.0239 18 11.1902Z" stroke="#0D0D0D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center absolute -top-0 right-1 font-mulish"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] rounded-xl border border-secondary/15 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-900">Notifications</span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 px-2 py-1.5 -mx-2 -my-1.5"
                >
                  Mark all read
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-secondary hover:underline px-2 py-1.5 -mx-2 -my-1.5"
              >
                View all
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[min(420px,60vh)] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <Skeleton circle width={36} height={36} />
                    <div className="flex-1">
                      <Skeleton width="60%" height={14} />
                      <Skeleton width="90%" height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No notifications yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100">
                {items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact
                    onClick={() => handleItemClick(notification)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
