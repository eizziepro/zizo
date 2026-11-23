import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
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
    <aside
      className="w-64 bg-[#17191A] text-[#FAF9F6] flex flex-col justify-between p-3.5 h-full border-r border-white/10 shrink-0 select-none overflow-hidden no-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      data-no-scrollbar
    >
      <div
        className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        data-no-scrollbar
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="inline-flex items-center hover:opacity-90 transition-opacity"
            aria-label="Zizo Admin Staff Portal"
          >
            <img
              src="/assets/img/zizo-donor-and-surrogacy-logo-white.png"
              alt="Zizo Admin Staff Portal"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="space-y-2 text-left" aria-label="Staff navigation">
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
          {(canAccess('inquiries') || canAccess('applications')) && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Clients
              </p>
              <div className="space-y-0.5 pt-1">
                {canAccess('inquiries') && (
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
                )}

                {canAccess('applications') && (
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
                )}
              </div>
            </div>
          )}

          {/* SCHEDULING GROUP */}
          {(canAccess('bookings') || canAccess('consultation-types')) && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Scheduling
              </p>
              <div className="space-y-0.5 pt-1">
                {canAccess('bookings') && (
                  <NavLink to="/bookings" className={navItemClass} onClick={onCloseMobile}>
                    <span className="inline-flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#8BB2AF]" />
                      Bookings
                    </span>
                  </NavLink>
                )}

                {canAccess('consultation-types') && (
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
                )}
              </div>
            </div>
          )}

          {/* WEBSITE CONTENT GROUP */}
          {(canAccess('services') || canAccess('blog') || canAccess('faqs') || canAccess('reviews')) && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Website Content
              </p>
              <div className="space-y-0.5 pt-1">
                {canAccess('services') && (
                  <NavLink to="/services" className={navItemClass} onClick={onCloseMobile}>
                    <span className="inline-flex items-center gap-3">
                      <LayersThree01 className="w-4 h-4 text-[#8BB2AF]" />
                      Services
                    </span>
                  </NavLink>
                )}

                {canAccess('blog') && (
                  <NavLink to="/blog" className={navItemClass} onClick={onCloseMobile}>
                    <span className="inline-flex items-center gap-3">
                      <BookOpen01 className="w-4 h-4 text-[#8BB2AF]" />
                      Blog
                    </span>
                  </NavLink>
                )}

                {canAccess('faqs') && (
                  <NavLink to="/faqs" className={navItemClass} onClick={onCloseMobile}>
                    <span className="inline-flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#8BB2AF]" />
                      FAQs
                    </span>
                  </NavLink>
                )}

                {/* Sidebar item: strictly Reviews */}
                {canAccess('reviews') && (
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
                )}
              </div>
            </div>
          )}

          {/* AUDIENCE GROUP */}
          {canAccess('subscribers') && (
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
