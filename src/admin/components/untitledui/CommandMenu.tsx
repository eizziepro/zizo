import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchLg,
  Activity,
  MessageDotsSquare,
  File02,
  Calendar,
  Clock,
  LayersThree01,
  BookOpen01,
  HelpCircle,
  Star01,
  Users01,
  User01,
  Settings01,
  FileCheck02,
  Lock01,
} from '@untitledui/icons';
import { usePermissions } from '../../hooks/usePermissions';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isOwner, isCoordinator, isEditor } = usePermissions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // toggled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'overview', title: 'Overview Dashboard', href: '/', icon: <Activity className="w-4 h-4" /> },
    ...(!isEditor
      ? [
          { id: 'inquiries', title: 'Inquiries', href: '/inquiries', icon: <MessageDotsSquare className="w-4 h-4" /> },
          { id: 'applications', title: 'Applications', href: '/applications', icon: <File02 className="w-4 h-4" /> },
          { id: 'bookings', title: 'Bookings Calendar & List', href: '/bookings', icon: <Calendar className="w-4 h-4" /> },
          { id: 'consultation-types', title: 'Consultation Types', href: '/consultation-types', icon: <Clock className="w-4 h-4" /> },
          { id: 'subscribers', title: 'Newsletter Subscribers', href: '/subscribers', icon: <Users01 className="w-4 h-4" /> },
        ]
      : []),
    ...(!isCoordinator
      ? [
          { id: 'services', title: 'Services Management', href: '/services', icon: <LayersThree01 className="w-4 h-4" /> },
          { id: 'blog', title: 'Blog Posts CMS', href: '/blog', icon: <BookOpen01 className="w-4 h-4" /> },
          { id: 'faqs', title: 'FAQs & Page Assignments', href: '/faqs', icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'reviews', title: 'Reviews Moderation', href: '/reviews', icon: <Star01 className="w-4 h-4" /> },
        ]
      : []),
    { id: 'profile', title: 'My Profile', href: '/settings/profile', icon: <User01 className="w-4 h-4" /> },
    { id: 'security', title: 'Security & 2FA', href: '/settings/security', icon: <Lock01 className="w-4 h-4" /> },
    ...(isOwner || isCoordinator
      ? [{ id: 'availability', title: 'Availability Rules', href: '/settings/availability', icon: <Clock className="w-4 h-4" /> }]
      : []),
    ...(isOwner
      ? [
          { id: 'site-settings', title: 'Site Settings', href: '/settings/site', icon: <Settings01 className="w-4 h-4" /> },
          { id: 'team', title: 'Team & Staff Roles', href: '/settings/team', icon: <Users01 className="w-4 h-4" /> },
          { id: 'audit-log', title: 'Audit Log & Activity Trail', href: '/audit-log', icon: <FileCheck02 className="w-4 h-4" /> },
        ]
      : []),
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-20 p-4 bg-[#17191A]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-[12px] bg-white border border-[#E1E0DD] shadow-2xl overflow-hidden z-10 flex flex-col text-left">
        <div className="flex items-center px-4 border-b border-[#E1E0DD]">
          <SearchLg className="w-5 h-5 text-[#5D5E5F] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a page or command to navigate..."
            className="w-full px-3 py-3.5 text-sm text-[#17191A] placeholder-[#969594] focus:outline-none"
          />
          <kbd className="text-[10px] text-[#5D5E5F] font-mono bg-[#F0EFEC] px-1.5 py-0.5 rounded border border-[#E1E0DD]">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigate(item.href);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm text-[#17191A] hover:bg-[#E2ECEB]/50 hover:text-[#17645F] transition-colors cursor-pointer text-left"
              >
                <span className="text-[#5D5E5F]">{item.icon}</span>
                <span className="font-medium flex-1">{item.title}</span>
                <span className="text-xs text-[#969594]">{item.href}</span>
              </button>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-[#5D5E5F]">No matching commands found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
