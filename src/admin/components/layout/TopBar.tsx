import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell01, SearchLg, Menu01 } from '@untitledui/icons';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../untitledui/Dropdown';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandMenu: () => void;
  notificationsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileSidebar,
  onOpenCommandMenu,
  notificationsCount = 0,
}) => {
  const location = useLocation();
  const { idleSecondsLeft } = useAuth();

  // Generate dynamic breadcrumbs based on pathname
  const pathSegments = location.pathname
    .replace(/^\/admin\/?/, '')
    .split('/')
    .filter(Boolean);

  const formatBreadcrumb = (segment: string) => {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const minutesLeft = Math.floor(idleSecondsLeft / 60);
  const secondsLeft = idleSecondsLeft % 60;
  const timeFormatted = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <header className="h-16 border-b border-[#E1E0DD] bg-white px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-[6px] text-[#5D5E5F] hover:bg-[#F0EFEC]"
          aria-label="Open sidebar"
        >
          <Menu01 className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-medium">
          <Link to="/admin/" className="text-[#5D5E5F] hover:text-[#17645F] transition-colors">
            Staff Portal
          </Link>
          {pathSegments.length > 0 &&
            pathSegments.map((segment, idx) => {
              const href = '/admin/' + pathSegments.slice(0, idx + 1).join('/');
              const isLast = idx === pathSegments.length - 1;

              return (
                <React.Fragment key={idx}>
                  <span className="text-[#969594]">/</span>
                  {isLast ? (
                    <span className="text-[#17191A] font-semibold">{formatBreadcrumb(segment)}</span>
                  ) : (
                    <Link to={href} className="text-[#5D5E5F] hover:text-[#17645F] transition-colors">
                      {formatBreadcrumb(segment)}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
        </nav>
      </div>

      {/* Right actions: Command Palette trigger & Notification Bell */}
      <div className="flex items-center gap-3">
        {/* Session idle indicator */}
        <span
          className="hidden sm:inline-block text-[11px] font-mono text-[#5D5E5F] bg-[#FAF9F6] border border-[#E1E0DD] px-2.5 py-1 rounded-full"
          title="Session idle timeout (30 min inactivity lock)"
        >
          Lock: {timeFormatted}
        </span>

        {/* Global Command Palette trigger (Cmd/Ctrl+K) */}
        <button
          type="button"
          onClick={onOpenCommandMenu}
          className="flex items-center gap-2 text-xs text-[#5D5E5F] bg-[#FAF9F6] hover:bg-[#F0EFEC] border border-[#E1E0DD] rounded-[8px] px-3 py-1.5 transition-colors cursor-pointer"
        >
          <SearchLg className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick jump</span>
          <kbd className="hidden md:inline font-mono text-[10px] bg-white border border-[#E1E0DD] px-1.5 py-0.5 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Notification Bell Dropdown */}
        <Dropdown
          placement="bottom-right"
          header={
            <div className="flex items-center justify-between text-left">
              <span className="text-xs font-semibold text-[#17191A]">Notifications</span>
              <span className="text-[10px] text-[#5D5E5F] font-mono">Live updates</span>
            </div>
          }
          items={[
            {
              id: 'notif-1',
              label: (
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#17191A]">New Intended Parent Inquiry</p>
                  <p className="text-[11px] text-[#5D5E5F]">Received 10 minutes ago</p>
                </div>
              ),
            },
            {
              id: 'notif-2',
              label: (
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#17191A]">Surrogate Application Pending</p>
                  <p className="text-[11px] text-[#5D5E5F]">Screening needed</p>
                </div>
              ),
            },
            {
              id: 'notif-3',
              label: (
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#17191A]">Pending Review for Moderation</p>
                  <p className="text-[11px] text-[#5D5E5F]">1 new review submitted</p>
                </div>
              ),
            },
          ]}
          trigger={(isOpen) => (
            <button
              type="button"
              className={`relative p-2 rounded-[8px] text-[#5D5E5F] hover:text-[#17191A] hover:bg-[#F0EFEC] transition-colors cursor-pointer ${
                isOpen ? 'bg-[#F0EFEC] text-[#17191A]' : ''
              }`}
              aria-label="View notifications"
            >
              <Bell01 className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#17645F]" />
              )}
            </button>
          )}
        />
      </div>
    </header>
  );
};
