import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, User01, Settings01, FileCheck02, LogOut01 } from '@untitledui/icons';
import { useAuth } from '../../context/AuthContext';
import { Dropdown, type DropdownItem } from '../untitledui/Dropdown';

export const AvatarMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isOwner = user.role === 'owner';

  const menuItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User01 className="w-4 h-4" />,
      onClick: () => navigate('/admin/settings/profile'),
    },
    {
      id: 'site-settings',
      label: 'Site Settings',
      icon: <Settings01 className="w-4 h-4" />,
      onClick: () => navigate('/admin/settings/site'),
      disabled: !isOwner,
    },
  ];

  if (isOwner) {
    menuItems.push({
      id: 'audit-log',
      label: 'Audit Log',
      icon: <FileCheck02 className="w-4 h-4" />,
      onClick: () => navigate('/admin/audit-log'),
    });
  }

  menuItems.push({
    id: 'sign-out',
    label: 'Sign out',
    icon: <LogOut01 className="w-4 h-4" />,
    destructive: true,
    dividerAbove: true,
    onClick: async () => {
      await signOut();
      navigate('/admin/login');
    },
  });

  const initials = (user.full_name || 'Staff User')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="pt-3 border-t border-white/10">
      <Dropdown
        placement="top-left"
        className="w-full"
        header={
          <div className="space-y-0.5 text-left">
            <p className="text-xs font-semibold text-[#17191A] truncate">{user.full_name}</p>
            <p className="text-xs text-[#5D5E5F] truncate">{user.email}</p>
          </div>
        }
        items={menuItems}
        trigger={(isOpen) => (
          <div
            className={`w-full flex items-center justify-between p-2.5 rounded-[8px] hover:bg-white/10 transition-colors text-left ${
              isOpen ? 'bg-white/10' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {user.avatar_path ? (
                <img
                  src={user.avatar_path}
                  alt={user.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#17645F] text-[#FAF9F6] font-semibold text-xs flex items-center justify-center shrink-0 border border-white/20">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#FAF9F6] truncate">
                  {user.display_name || user.full_name}
                </p>
                <p className="text-xs text-[#8BB2AF] capitalize tracking-wide truncate">
                  {user.role}
                </p>
              </div>
            </div>
            <ChevronUp className="w-4 h-4 text-[#FAF9F6]/60 shrink-0 ml-2" />
          </div>
        )}
      />
    </div>
  );
};
