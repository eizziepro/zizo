import React from 'react';
import { DotsVertical } from '@untitledui/icons';
import { Dropdown, type DropdownItem } from '../untitledui/Dropdown';

interface RowActionsMenuProps {
  rowLabel: string;
  items: DropdownItem[];
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({
  rowLabel,
  items,
  placement = 'bottom-right',
}) => {
  return (
    <div
      onClick={(e) => {
        // Prevent row click when clicking on actions trigger
        e.stopPropagation();
      }}
    >
      <Dropdown
        placement={placement}
        items={items}
        trigger={(isOpen) => (
          <button
            type="button"
            aria-label={`Actions for ${rowLabel}`}
            title="Actions"
            className={`p-1.5 rounded-[6px] text-[#5D5E5F] hover:text-[#17191A] hover:bg-[#F0EFEC] transition-colors cursor-pointer ${
              isOpen ? 'bg-[#F0EFEC] text-[#17191A]' : ''
            }`}
          >
            <DotsVertical className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
};
