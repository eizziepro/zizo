import React, { useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name = '',
  initials,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  // Derive initials if not explicitly provided
  const computedInitials =
    initials ||
    (name
      ? name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'U');

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        onError={() => setHasError(true)}
        className={`rounded-full object-cover shrink-0 ring-1 ring-black/5 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-[#17645F] text-[#FAF9F6] font-semibold flex items-center justify-center shrink-0 select-none ring-1 ring-black/5 ${sizeClasses[size]} ${className}`}
      title={name || alt}
      aria-label={name || alt}
    >
      {computedInitials}
    </div>
  );
};
