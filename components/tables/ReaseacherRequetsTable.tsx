"use client";

import { Check, X, User } from "lucide-react";
import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ApproveRequestConfirmation from "@/components/modal/ApproveRequestConfirmation";
import { useUpdateResearcherStatus } from "@/hooks/authentication";

export type ResearcherRequest = {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    role: string;
    approval_status: string;
    id: number;
    created_at: string;
    updated_at: string;
  };
  cluster_id: number;
  status: string;
  created_at: string;
  updated_at: string;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ReaseacherRequetsTableProps {
  data?: ResearcherRequest[];
  isLoading?: boolean;
}

const SKELETON_ROWS = 6;

export default function ReaseacherRequetsTable({
  data = [],
  isLoading = false,
}: ReaseacherRequetsTableProps) {
  const { mutate: updateStatus, isPending } = useUpdateResearcherStatus();

  const [modal, setModal] = useState<{
    isOpen: boolean;
    action: "approved" | "declined";
    requestId: number;
    researcherName: string;
  }>({
    isOpen: false,
    action: "approved",
    requestId: 0,
    researcherName: "",
  });

  const openModal = (
    action: "approved" | "declined",
    requestId: number,
    researcherName: string
  ) => {
    setModal({ isOpen: true, action, requestId, researcherName });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    updateStatus(
      { requestId: modal.requestId, status: modal.action },
      { onSuccess: closeModal, onError: closeModal }
    );
  };

  return (
    <>
      <ApproveRequestConfirmation
        isOpen={modal.isOpen}
        action={modal.action}
        researcherName={modal.researcherName}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />

      <div className="bg-white">
        <div className="overflow-hidden rounded-2xl mt-4 border border-secondary/15">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#DAE3F8]/30 font-raleway">
              <tr className="text-gray-700 text-sm">
                <th className="px-6 py-5 font-bold">Researcher</th>
                <th className="px-6 py-5 font-bold">Email</th>
                <th className="px-6 py-5 font-bold text-center">Status</th>
                <th className="px-6 py-5 font-bold text-center">Date Requested</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading
                ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                    >
                      <td className="px-5 py-5">
                        <Skeleton width={150} height={14} />
                      </td>
                      <td className="px-5 py-5">
                        <Skeleton width={180} height={14} />
                      </td>
                      <td className="px-5 py-5 text-center">
                        <Skeleton width={80} height={14} />
                      </td>
                      <td className="px-5 py-5 text-center">
                        <Skeleton width={100} height={14} />
                      </td>
                      <td className="px-5 py-5 flex justify-end gap-2">
                        <Skeleton width={24} height={24} circle />
                        <Skeleton width={24} height={24} circle />
                      </td>
                    </tr>
                  ))
                : data.map((row, index) => {
                    const researcherName =
                      `${row.user.first_name} ${row.user.last_name}`.trim() ||
                      row.user.email;
                    const isPending = row.status === "pending";

                    return (
                      <tr
                        key={row.id ?? index}
                        className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <User size={16} />
                            </div>
                            <span className="font-raleway font-medium">
                              {researcherName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-5 font-raleway font-medium text-gray-600">
                          {row.user.email}
                        </td>
                        <td className="px-5 py-5 font-raleway text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              row.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : row.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.status.charAt(0).toUpperCase() +
                              row.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-5 font-raleway text-center text-gray-500">
                          {formatDate(row.created_at)}
                        </td>
                        <td className="px-5 py-5 flex gap-2 justify-end items-center">
                          <button
                            disabled={!isPending}
                            onClick={() =>
                              openModal("approved", row.id, researcherName)
                            }
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Approve"
                          >
                            <Check size={18} strokeWidth={2.5} />
                          </button>
                          <button
                            disabled={!isPending}
                            onClick={() =>
                              openModal("declined", row.id, researcherName)
                            }
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Decline"
                          >
                            <X size={18} strokeWidth={2.5} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

              {!isLoading && data.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    No researcher requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}