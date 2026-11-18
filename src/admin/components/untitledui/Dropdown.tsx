import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number; openUpwards: boolean }>({
    top: 0,
    openUpwards: false,
  });

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const estimatedHeight = items.length * 38 + (header ? 44 : 0) + 16;
    const menuHeight = menuRef.current?.offsetHeight || estimatedHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUpwards = placement.startsWith('top') || (spaceBelow < menuHeight && spaceAbove > spaceBelow);

    const top = shouldOpenUpwards
      ? Math.max(8, rect.top - menuHeight - 6)
      : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 6);

    const isLeftAligned = placement.endsWith('left');
    if (isLeftAligned) {
      setCoords({
        top,
        left: Math.max(8, rect.left),
        openUpwards: shouldOpenUpwards,
      });
    } else {
      setCoords({
        top,
        right: Math.max(8, window.innerWidth - rect.right),
        openUpwards: shouldOpenUpwards,
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      const raf = requestAnimationFrame(() => {
        updatePosition();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const menuContent = isOpen && typeof document !== 'undefined' ? (
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: `${coords.top}px`,
          ...(coords.left !== undefined ? { left: `${coords.left}px` } : {}),
          ...(coords.right !== undefined ? { right: `${coords.right}px` } : {}),
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
        className="min-w-[200px] rounded-[10px] bg-white border border-[#E1E0DD] shadow-xl py-1 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
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
                onClick={(e) => {
                  e.stopPropagation();
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
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="cursor-pointer"
      >
        {trigger(isOpen)}
      </div>

      {menuContent}
    </div>
  );
};
