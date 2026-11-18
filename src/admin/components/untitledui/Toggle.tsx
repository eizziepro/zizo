import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}) => {
  const switchWidth = size === 'sm' ? 'w-8 h-4.5' : 'w-11 h-6';
  const knobSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  const translateChecked = size === 'sm' ? 'translate-x-3.5' : 'translate-x-5';

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex shrink-0 ${switchWidth} rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:ring-offset-2 ${
          checked ? 'bg-[#17645F]' : 'bg-[#C8C7C5]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block ${knobSize} rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
            checked ? translateChecked : 'translate-x-0.5'
          } my-auto`}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-sm font-medium text-[#17191A]">{label}</span>}
          {description && <span className="text-xs text-[#5D5E5F]">{description}</span>}
        </div>
      )}
    </label>
  );
};
