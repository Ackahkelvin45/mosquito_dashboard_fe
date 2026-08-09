"use client";

import React, { useState } from "react";
import { Check, Copy, KeyRound, Loader2, TriangleAlert, X } from "lucide-react";
import { useCreateApiKey } from "@/hooks/apiKeys";

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateApiKeyModal({ isOpen, onClose }: CreateApiKeyModalProps) {
  const createMutation = useCreateApiKey();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const created = createMutation.data;
  const isPending = createMutation.isPending;

  const close = () => {
    // reset() so the raw key never lingers in mutation state (it would flash
    // back the next time the modal opens).
    createMutation.reset();
    setName("");
    setDescription("");
    setExpiresInDays("");
    setCopied(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(expiresInDays, 10);
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      expires_in_days: Number.isFinite(days) && days > 0 ? days : undefined,
    });
  };

  const handleCopy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard needs a secure context — the key is selectable text below.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto p-4">
      {/* Backdrop — once the key is revealed, a stray click must NOT close
          the modal: this is the only time the key is ever visible. */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isPending && !created ? close : undefined}
      />

      <div className="relative z-10 m-auto bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <KeyRound size={20} strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-gray-900 font-raleway">
              {created ? "API Key Created" : "Create API Key"}
            </h2>
          </div>
          {!created && (
            <button
              onClick={close}
              disabled={isPending}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-2 -m-2"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {created ? (
          /* ── Reveal state: shown exactly once ─────────────────────────── */
          <div className="px-6 pb-6">
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
              <TriangleAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-raleway leading-relaxed">
                Copy this key now — for security it is stored hashed and{" "}
                <span className="font-semibold">cannot be shown again</span>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-800 break-all select-all font-mono">
                {created.api_key}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/40 transition-colors"
                aria-label="Copy API key"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              </button>
            </div>

            <p className="text-xs text-gray-500 font-raleway mt-3">
              Use it in the <code className="font-mono">X-API-Key</code> header when calling the data API.
            </p>

            <div className="flex justify-end mt-5">
              <button
                onClick={close}
                className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary/90 transition-colors font-raleway"
              >
                I&apos;ve saved my key
              </button>
            </div>
          </div>
        ) : (
          /* ── Form state ───────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="px-6 pb-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-raleway mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="e.g. Malaria research 2026"
                  className="w-full py-2.5 px-3 border border-gray-300 text-sm rounded-lg focus:border-primary focus:outline-none focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-raleway mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={255}
                  placeholder="What will this key be used for?"
                  className="w-full py-2.5 px-3 border border-gray-300 text-sm rounded-lg focus:border-primary focus:outline-none focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-raleway mb-1.5">
                  Expires in (days)
                </label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  min={1}
                  max={3650}
                  placeholder="Leave empty for no expiry"
                  className="w-full py-2.5 px-3 border border-gray-300 text-sm rounded-lg focus:border-primary focus:outline-none focus:ring-0"
                />
              </div>

              {createMutation.isError && (
                <p className="text-xs text-red-600 font-raleway">
                  {(createMutation.error as Error)?.message || "Failed to create API key"}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={close}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-raleway"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || name.trim().length < 2}
                className="px-5 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-raleway bg-primary hover:bg-primary/90"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Create Key
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
