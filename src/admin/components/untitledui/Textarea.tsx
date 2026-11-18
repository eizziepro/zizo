import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#17191A]">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`w-full rounded-[8px] border bg-white px-3.5 py-2.5 text-base md:text-sm text-[#17191A] placeholder-[#969594] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F] disabled:bg-[#F0EFEC] disabled:text-[#969594] disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E1E0DD]'
          } ${className}`}
          rows={props.rows || 4}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600 font-medium" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-[#5D5E5F]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
