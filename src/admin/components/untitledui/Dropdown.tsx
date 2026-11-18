import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  dividerAbove?: boolean;
}

interface DropdownProps {
  trigger: (isOpen: boolean) => React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  header?: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-right',
  header,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const placementClasses = {
    'bottom-right': 'top-full right-0 mt-1.5',
    'bottom-left': 'top-full left-0 mt-1.5',
    'top-right': 'bottom-full right-0 mb-1.5',
    'top-left': 'bottom-full left-0 mb-1.5',
  }[placement];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger(isOpen)}
      </div>

      {isOpen && (
        <div
          className={`absolute ${placementClasses} z-[110] min-w-[200px] rounded-[10px] bg-white border border-[#E1E0DD] shadow-xl py-1 focus:outline-none animate-in fade-in zoom-in-95 duration-100`}
          role="menu"
        >
          {header && <div className="px-3.5 py-2.5 border-b border-[#E1E0DD]">{header}</div>}

          <div className="py-1">
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.dividerAbove && <div className="my-1 border-t border-[#E1E0DD]" role="separator" />}
                <button
                  type="button"
                  disabled={item.disabled}
                  role="menuitem"
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.();
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    item.destructive
                      ? 'text-[#D92D20] hover:bg-[#FDF2F2]'
                      : 'text-[#17191A] hover:bg-[#F0EFEC]'
                  }`}
                >
                  {item.icon && <span className="w-4 h-4 shrink-0 text-[#5D5E5F]">{item.icon}</span>}
                  <span className="flex-1 font-medium">{item.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
