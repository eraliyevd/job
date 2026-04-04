"use client";

import { forwardRef, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
}

/**
 * Uzbek phone input.
 * Stores and emits full "+998XXXXXXXXX" format.
 * Displays only the 9-digit suffix; prefix "+998" is shown as fixed label.
 *
 * Example: value = "+998901234567" → shows "90 123 45 67"
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, label, placeholder = "XX XXX XX XX", className, disabled, autoFocus, name, id }, _ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    /** Strip everything except digits from the 9-digit suffix */
    const getSuffix = (full: string) =>
      full.replace(/^\+998/, "").replace(/\D/g, "").slice(0, 9);

    /** Format 9 digits as "XX XXX XX XX" */
    const formatDisplay = (digits: string) => {
      const d = digits.replace(/\D/g, "").slice(0, 9);
      if (d.length <= 2) return d;
      if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
      if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
      return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const raw    = e.target.value.replace(/\D/g, "").slice(0, 9);
      const full   = raw.length > 0 ? `+998${raw}` : "";
      onChange(full);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Prevent typing more than 9 digits (allow backspace/delete/arrows)
      const suffix = getSuffix(value);
      const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"];
      if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && suffix.length >= 9) {
        e.preventDefault();
      }
    };

    const displayValue = formatDisplay(getSuffix(value));

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex items-center w-full rounded-xl border bg-white dark:bg-dark-700 transition-all duration-200",
            "focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent",
            error
              ? "border-red-400 dark:border-red-500"
              : "border-slate-200 dark:border-dark-600 hover:border-slate-300 dark:hover:border-dark-500",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Prefix badge */}
          <span className="flex items-center gap-1.5 pl-4 pr-2 text-sm font-semibold text-slate-500 dark:text-slate-400 select-none whitespace-nowrap border-r border-slate-200 dark:border-dark-600 py-3">
            🇺🇿 <span className="font-mono">+998</span>
          </span>

          <input
            ref={inputRef}
            id={id}
            name={name}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            autoFocus={autoFocus}
            disabled={disabled}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 px-3 py-3 bg-transparent text-sm font-mono text-slate-900 dark:text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-sans",
              "outline-none disabled:cursor-not-allowed",
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>

        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
export default PhoneInput;
