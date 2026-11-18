import React from 'react';
import { ChevronDown } from '@untitledui/icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options = [], children, id, className = '', ...props }, ref) => {
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
          <select
            id={inputId}
            ref={ref}
            className={`w-full appearance-none rounded-[8px] border bg-white pl-3.5 pr-10 py-2 text-base md:text-sm text-[#17191A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F] disabled:bg-[#F0EFEC] disabled:text-[#969594] disabled:cursor-not-allowed ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E1E0DD]'
            } ${className}`}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#5D5E5F]">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
