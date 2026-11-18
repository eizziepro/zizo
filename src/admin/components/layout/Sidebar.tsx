import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity,
  MessageDotsSquare,
  File02,
  Folder,
  Calendar,
  Clock,
  LayersThree01,
  BookOpen01,
  HelpCircle,
  Star01,
  Users01,
} from '@untitledui/icons';
import { usePermissions } from '../../hooks/usePermissions';
import { AvatarMenu } from './AvatarMenu';
import { Badge } from '../untitledui/Badge';

interface SidebarProps {
  badgeCounts?: {
    newInquiries?: number;
    newApplications?: number;
    pendingReviews?: number;
  };
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ badgeCounts = {}, onCloseMobile }) => {
  const { canAccess, isCoordinator, isEditor } = usePermissions();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#17645F] text-[#FAF9F6] font-semibold shadow-xs'
        : 'text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:bg-white/10'
    }`;

  return (
    <aside className="w-64 bg-[#17191A] text-[#FAF9F6] flex flex-col justify-between p-3.5 h-full border-r border-white/10 shrink-0 select-none overflow-hidden">
      <div
        className="space-y-3 flex-1 overflow-y-auto no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-2 pt-0.5 pb-0.5">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="inline-flex items-center gap-2.5 text-[#FAF9F6] hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#17645F] flex items-center justify-center font-display font-semibold text-lg text-white">
              Z
            </div>
            <div className="text-left">
              <span className="font-display text-base font-semibold block leading-tight">
                Zizo Admin
              </span>
              <span className="text-[10px] text-[#8BB2AF] uppercase tracking-wider block">
                Staff Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="space-y-2.5 text-left" aria-label="Staff navigation">
          {/* Overview */}
          <div>
            <NavLink to="/" end className={navItemClass} onClick={onCloseMobile}>
              <span className="inline-flex items-center gap-3">
                <Activity className="w-4 h-4 text-[#8BB2AF]" />
                Overview
              </span>
            </NavLink>
          </div>

          {/* CLIENTS GROUP */}
          {!isEditor && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Clients
              </p>
              <div className="space-y-0.5 pt-1">
                <NavLink to="/inquiries" className={navItemClass} onClick={onCloseMobile}>
                  <span className="inline-flex items-center gap-3">
                    <MessageDotsSquare className="w-4 h-4 text-[#8BB2AF]" />
                    Inquiries
                  </span>
                  {Boolean(badgeCounts.newInquiries && badgeCounts.newInquiries > 0) && (
                    <Badge variant="brand" size="sm">
                      {badgeCounts.newInquiries}
                    </Badge>
                  )}
                </NavLink>

                <NavLink to="/applications" className={navItemClass} onClick={onCloseMobile}>
                  <span className="inline-flex items-center gap-3">
                    <File02 className="w-4 h-4 text-[#8BB2AF]" />
                    Applications
                  </span>
                  {Boolean(badgeCounts.newApplications && badgeCounts.newApplications > 0) && (
                    <Badge variant="brand" size="sm">
                      {badgeCounts.newApplications}
                    </Badge>
                  )}
                </NavLink>

                {/* Cases: Phase 2 disabled */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-[8px] text-sm text-[#FAF9F6]/40 cursor-not-allowed"
                  title="Cases module coming in Phase 2"
                >
                  <span className="inline-flex items-center gap-3">
                    <Folder className="w-4 h-4 text-[#8BB2AF]/40" />
                    Cases
                  </span>
                  <Badge variant="gray" size="sm">
                    Soon
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULING GROUP */}
          {!isEditor && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Scheduling
              </p>
              <div className="space-y-0.5 pt-1">
                <NavLink to="/bookings" className={navItemClass} onClick={onCloseMobile}>
                  <span className="inline-flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#8BB2AF]" />
                    Bookings
                  </span>
                </NavLink>

                <NavLink
                  to="/consultation-types"
                  className={navItemClass}
                  onClick={onCloseMobile}
                >
                  <span className="inline-flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#8BB2AF]" />
                    Consultation Types
                  </span>
                </NavLink>
              </div>
            </div>
          )}

          {/* WEBSITE CONTENT GROUP */}
          {!isCoordinator && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Website Content
              </p>
              <div className="space-y-0.5 pt-1">
                <NavLink to="/services" className={navItemClass} onClick={onCloseMobile}>
                  <span className="inline-flex items-center gap-3">
                    <LayersThree01 className="w-4 h-4 text-[#8BB2AF]" />
                    Services
                  </span>
                </NavLink>

                <NavLink to="/blog" className={navItemClass} onClick={onCloseMobile}>
                  <span className="inline-flex items-center gap-3">
                    <BookOpen01 className="w-4 h-4 text-[#8BB2AF]" />
                    Blog
                  </span>
                </NavLink>

                <NavLink to="/faqs" className={navItemClass} onClick={onCloseMobile}>
                  <span className="inline-flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#8BB2AF]" />
                    FAQs
                  </span>
                </NavLink>

                {/* Sidebar item: strictly Reviews */}
                <NavLink to="/reviews" className={navItemClass} onClick={onCloseMobile}>
                  <span className="inline-flex items-center gap-3">
                    <Star01 className="w-4 h-4 text-[#8BB2AF]" />
                    Reviews
                  </span>
                  {Boolean(badgeCounts.pendingReviews && badgeCounts.pendingReviews > 0) && (
                    <Badge variant="warning" size="sm">
                      {badgeCounts.pendingReviews}
                    </Badge>
                  )}
                </NavLink>
              </div>
            </div>
          )}

          {/* AUDIENCE GROUP */}
          {!isEditor && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Audience
              </p>
              <div className="space-y-0.5 pt-1">
                <NavLink to="/subscribers" className={navItemClass} onClick={onCloseMobile}>
                  <span className="inline-flex items-center gap-3">
                    <Users01 className="w-4 h-4 text-[#8BB2AF]" />
                    Subscribers
                  </span>
                </NavLink>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User avatar card at bottom */}
      <AvatarMenu />
    </aside>
  );
};
