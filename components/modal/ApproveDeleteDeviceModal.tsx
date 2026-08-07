"use client";

import React from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface ApproveDeleteDeviceModalProps {
  isOpen: boolean;
  deviceName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ApproveDeleteDeviceModal({
  isOpen,
  deviceName,
  isPending,
  onConfirm,
  onCancel,
}: ApproveDeleteDeviceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isPending ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 m-auto bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600`}
            >
              <AlertTriangle size={20} strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-gray-900 font-raleway">
              Delete Device
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-2 -m-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 font-raleway leading-relaxed break-words">
            Are you sure you want to{" "}
            <span className="font-semibold text-red-600">delete</span>{" "}
            the device{" "}
            <span className="font-semibold text-gray-900">
              {deviceName}
            </span>
            ? This action cannot be undone and will permanently remove all associated data.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-raleway"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`px-5 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-raleway bg-red-600 hover:bg-red-700`}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
