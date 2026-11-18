import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'tertiary';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      iconLeading,
      iconTrailing,
      isLoading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        'bg-[#17645F] text-[#FAF9F6] hover:bg-[#155A56] active:bg-[#12504C] border border-transparent shadow-sm focus-visible:outline-[#17645F]',
      secondary:
        'bg-white text-[#17191A] hover:bg-[#F0EFEC] active:bg-[#E1E0DD] border border-[#E1E0DD] shadow-sm focus-visible:outline-[#17645F]',
      destructive:
        'bg-[#D92D20] text-white hover:bg-[#B42318] active:bg-[#912018] border border-transparent shadow-sm focus-visible:outline-[#D92D20]',
      tertiary:
        'bg-transparent text-[#5D5E5F] hover:text-[#17191A] hover:bg-[#F0EFEC] active:bg-[#E1E0DD] border-none focus-visible:outline-[#17645F]',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-[6px]',
      md: 'px-4 py-2 text-sm rounded-[8px]',
      lg: 'px-5 py-2.5 text-base rounded-[8px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && iconLeading && <span className="mr-2 inline-flex shrink-0">{iconLeading}</span>}
        <span>{children}</span>
        {!isLoading && iconTrailing && <span className="ml-2 inline-flex shrink-0">{iconTrailing}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
