"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, MapPin, Shield, UserRound } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { useChangePassword, useCurrentUser, useUpdateProfile } from "@/hooks/authentication";
import { useAuthStore } from "@/store/authStore";
import "react-loading-skeleton/dist/skeleton.css";

// Mirrors the registration/reset policy so errors surface before the request.
function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  return null;
}

const roleLabel = (role?: string) =>
  role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN" ? "Cluster Admin" : "User";

const inputClass =
  "w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md";

function Banner({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const styles =
    tone === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-green-50 border-green-200 text-green-700";
  return <div className={`rounded-md border text-sm px-3 py-2.5 ${styles}`}>{children}</div>;
}

export default function ProfilePage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Seed the form once the user loads (and re-seed after an external refresh).
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
    }
  }, [user]);

  const initials = `${(user?.first_name ?? "?")[0] ?? ""}${(user?.last_name ?? "")[0] ?? ""}`.toUpperCase();
  const namesDirty =
    !!user && (firstName.trim() !== (user.first_name ?? "") || lastName.trim() !== (user.last_name ?? ""));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setProfileError("First and last name must each be at least 2 characters.");
      return;
    }
    updateProfile.mutate(
      { first_name: firstName.trim(), last_name: lastName.trim() },
      {
        onSuccess: (res) => {
          if (res.success) {
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2500);
          } else {
            setProfileError(res.error);
          }
        },
        onError: () => setProfileError("Something went wrong. Please try again."),
      }
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    const policyError = validatePassword(newPassword);
    if (policyError) {
      setPasswordError(policyError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: (res) => {
          if (res.success) {
            // The backend invalidated every session — sign back in.
            logout();
            router.replace("/login");
          } else {
            setPasswordError(res.error);
          }
        },
        onError: () => setPasswordError("Something went wrong. Please try again."),
      }
    );
  };

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account details, name and password.</p>
      </div>

      {/* Identity card */}
      <div className="border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-linear-to-r from-secondary to-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
          {isLoading ? "…" : initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-gray-900 truncate">
            {isLoading ? <Skeleton width={160} /> : `${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 min-w-0">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{isLoading ? <Skeleton width={140} /> : user?.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="shrink-0" />
              {isLoading ? <Skeleton width={70} /> : roleLabel(user?.role)}
            </span>
            {user?.cluster?.name && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0" />
                {user.cluster.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Edit name */}
        <form onSubmit={handleSaveProfile} className="border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <UserRound size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-gray-800">Edit profile</h2>
          </div>
          {profileError && <Banner tone="error">{profileError}</Banner>}
          {profileSaved && <Banner tone="success">Profile updated.</Banner>}
          <div>
            <label htmlFor="first_name" className="text-dark text-sm mb-2 font-medium block">First name</label>
            <input id="first_name" value={firstName} maxLength={50}
                   onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="last_name" className="text-dark text-sm mb-2 font-medium block">Last name</label>
            <input id="last_name" value={lastName} maxLength={50}
                   onChange={(e) => setLastName(e.target.value)} className={inputClass} />
          </div>
          <p className="text-xs text-gray-400 -mt-1">
            Email and role can only be changed by an administrator.
          </p>
          <button
            type="submit"
            disabled={updateProfile.isPending || !namesDirty}
            className="py-2.5 px-4 self-start flex items-center justify-center bg-linear-to-r from-secondary to-primary font-semibold text-white text-sm rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? <div className="spinner1" /> : "Save changes"}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-gray-800">Change password</h2>
          </div>
          {passwordError && <Banner tone="error">{passwordError}</Banner>}
          <div>
            <label htmlFor="current_password" className="text-dark text-sm mb-2 font-medium block">Current password</label>
            <input id="current_password" type="password" autoComplete="current-password"
                   value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                   required className={inputClass} />
          </div>
          <div>
            <label htmlFor="new_password" className="text-dark text-sm mb-2 font-medium block">New password</label>
            <input id="new_password" type="password" autoComplete="new-password"
                   value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                   required className={inputClass} />
          </div>
          <div>
            <label htmlFor="confirm_password" className="text-dark text-sm mb-2 font-medium block">Confirm new password</label>
            <input id="confirm_password" type="password" autoComplete="new-password"
                   value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                   required className={inputClass} />
          </div>
          <p className="text-xs text-gray-400 -mt-1">
            At least 8 characters with a number and an uppercase letter. Changing your
            password signs you out everywhere.
          </p>
          <button
            type="submit"
            disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
            className="py-2.5 px-4 self-start flex items-center justify-center bg-linear-to-r from-secondary to-primary font-semibold text-white text-sm rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {changePassword.isPending ? <div className="spinner1" /> : "Change password"}
          </button>
        </form>
      </div>

    </div>
  );
}
