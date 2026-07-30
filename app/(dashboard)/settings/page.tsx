"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { KeyRound, LogOut, Mail, Shield, BadgeCheck, CalendarClock, Hash, MapPin } from "lucide-react";
import { useCurrentUser } from "@/hooks/authentication";
import { useAuthStore } from "@/store/authStore";

// Mirrors the /auth/me (UserResponse) shape. `cluster`/`community` are optional
// so this page already renders them once the role/cluster work lands, without
// another change here.
type CurrentUser = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  approval_status?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  cluster?: { id: number; name: string } | null;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

// Backend roles are UPPER_SNAKE; show something a person reads.
function roleLabel(role: string | null | undefined): string {
  switch ((role ?? "").toUpperCase()) {
    case "SUPER_ADMIN": return "Super Admin";
    case "ADMIN": return "Cluster Admin";
    case "USER": return "User";
    default: return role || "User";
  }
}

function roleClasses(role: string | null | undefined): string {
  switch ((role ?? "").toUpperCase()) {
    case "SUPER_ADMIN": return "bg-secondary/10 text-secondary";
    case "ADMIN": return "bg-primary/10 text-primary";
    default: return "bg-gray-100 text-gray-600";
  }
}

function statusClasses(status: string | null | undefined): string {
  switch ((status ?? "").toUpperCase()) {
    case "APPROVED": return "bg-green-100 text-green-700";
    case "REJECTED": return "bg-red-100 text-red-600";
    default: return "bg-amber-100 text-amber-700";
  }
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium text-gray-800 text-right min-w-0 truncate">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { data, isLoading, isError } = useCurrentUser();
  const user = data as CurrentUser | undefined;

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "User";
  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 font-raleway">
      <h1 className="text-xl font-semibold text-primary px-1">Profile</h1>

      {isError ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Couldn&apos;t load your profile. Please try again.
          </p>
        </div>
      ) : (
        <>
          {/* Identity card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {isLoading ? (
                <Skeleton circle width={80} height={80} />
              ) : (
                <div className="w-20 h-20 shrink-0 rounded-full bg-linear-to-br from-secondary to-primary text-white flex items-center justify-center text-2xl font-bold">
                  {initials}
                </div>
              )}

              <div className="flex-1 min-w-0 text-center sm:text-left">
                {isLoading ? (
                  <div className="flex flex-col gap-2 items-center sm:items-start">
                    <Skeleton width={200} height={24} />
                    <Skeleton width={240} height={16} />
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-gray-900 truncate">{fullName}</h2>
                    <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-500 mt-0.5">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{user?.email ?? "—"}</span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleClasses(user?.role)}`}>
                        {roleLabel(user?.role)}
                      </span>
                      {user?.approval_status && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses(user.approval_status)}`}>
                          {user.approval_status[0] + user.approval_status.slice(1).toLowerCase()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Account details
            </h3>
            {isLoading ? (
              <div className="flex flex-col gap-3 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} height={20} />
                ))}
              </div>
            ) : (
              <div className="mt-1">
                <DetailRow icon={<Hash size={16} />} label="User ID">#{user?.id ?? "—"}</DetailRow>
                <DetailRow icon={<Shield size={16} />} label="Role">{roleLabel(user?.role)}</DetailRow>
                {user?.cluster && (
                  <DetailRow icon={<MapPin size={16} />} label="Cluster">{user.cluster.name}</DetailRow>
                )}
                <DetailRow icon={<BadgeCheck size={16} />} label="Account status">
                  <span className={user?.is_active ? "text-green-600" : "text-gray-500"}>
                    {user?.is_active ? "Active" : "Inactive"}
                  </span>
                </DetailRow>
                <DetailRow icon={<CalendarClock size={16} />} label="Member since">
                  {formatDate(user?.created_at)}
                </DetailRow>
                <DetailRow icon={<CalendarClock size={16} />} label="Last updated">
                  {formatDate(user?.updated_at)}
                </DetailRow>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Security</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Reset your password or sign out of this session.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/forgot-password"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <KeyRound size={16} />
                Change password
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
