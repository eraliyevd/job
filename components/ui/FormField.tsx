import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?:  string;
  right?: ReactNode;  // e.g. show/hide password button
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, right, className, id, ...props }, ref) => {
    const fieldId = id ?? `field-${label.toLowerCase().replace(/\s/g, "-")}`;

    return (
      <div className="w-full">
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            className={cn(
              "input-base",
              right && "pr-12",
              error && "border-red-400 dark:border-red-500 focus:ring-red-400",
              className
            )}
            {...props}
          />

          {right && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {right}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
export default FormField;
