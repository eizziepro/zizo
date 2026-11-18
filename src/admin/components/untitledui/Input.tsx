import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, iconLeading, iconTrailing, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#17191A]">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-[8px] shadow-xs">
          {iconLeading && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5D5E5F]">
              {iconLeading}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-[8px] border bg-white px-3.5 py-2 text-base md:text-sm text-[#17191A] placeholder-[#969594] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F] disabled:bg-[#F0EFEC] disabled:text-[#969594] disabled:cursor-not-allowed ${
              iconLeading ? 'pl-10' : ''
            } ${iconTrailing ? 'pr-10' : ''} ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E1E0DD]'
            } ${className}`}
            {...props}
          />
          {iconTrailing && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5D5E5F]">
              {iconTrailing}
            </div>
          )}
        </div>
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

Input.displayName = 'Input';
