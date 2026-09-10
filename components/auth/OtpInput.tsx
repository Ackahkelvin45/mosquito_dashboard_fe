"use client";

import React, { useRef } from "react";

/**
 * Six one-digit boxes for verification codes. The parent keeps the code as a
 * plain string (0–6 digits); this component handles per-box focus flow:
 * typing auto-advances, backspace clears and steps back, arrows navigate,
 * and pasting distributes all six digits at once.
 */
export default function OtpInput({
  value,
  onChange,
  disabled,
  autoFocus,
  length = 6,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  length?: number;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusBox = (index: number) => {
    const box = refs.current[Math.max(0, Math.min(length - 1, index))];
    box?.focus();
    box?.select();
  };

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    // Trim trailing empties so value stays a simple prefix string.
    onChange(next.join("").slice(0, length));
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigit(index, "");
      return;
    }
    // More than one digit here means an autofill/paste landed in one box.
    if (cleaned.length > 1) {
      onChange(cleaned.slice(0, length));
      focusBox(cleaned.length >= length ? length - 1 : cleaned.length);
      return;
    }
    setDigit(index, cleaned);
    if (index < length - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigit(index - 1, "");
      focusBox(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focusBox(pasted.length >= length ? length - 1 : pasted.length);
  };

  return (
    <div className="flex gap-2 justify-between" role="group" aria-label={`${length}-digit verification code`}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length} /* roomy so an autofilled code isn't truncated */
          aria-label={`Digit ${i + 1}`}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-full aspect-square max-w-[52px] text-center text-xl font-semibold border border-gray rounded-md focus:border-primary focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}
