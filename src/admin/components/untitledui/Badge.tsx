import React from 'react';

export type BadgeVariant = 'brand' | 'gray' | 'success' | 'warning' | 'error' | 'blue';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    brand: 'bg-[#E2ECEB] text-[#17645F] border-[#C5D8D7]',
    gray: 'bg-[#F0EFEC] text-[#454748] border-[#E1E0DD]',
    success: 'bg-[#EDF7EE] text-[#1E4620] border-[#C8E6C9]',
    warning: 'bg-[#FFF8E6] text-[#7A4F01] border-[#FFE082]',
    error: 'bg-[#FDF2F2] text-[#9B1C1C] border-[#F8B4B4]',
    blue: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotColors = {
    brand: 'bg-[#17645F]',
    gray: 'bg-[#747576]',
    success: 'bg-[#2E7D32]',
    warning: 'bg-[#B76E00]',
    error: 'bg-[#D32F2F]',
    blue: 'bg-[#1570EF]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
};
