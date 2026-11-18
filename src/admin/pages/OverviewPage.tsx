import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Badge } from '../components/untitledui/Badge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  MessageDotsSquare,
  File02,
  Calendar,
  Star01,
  ArrowRight,
  TrendUp01,
  Clock,
} from '@untitledui/icons';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { isEditor, isCoordinator } = usePermissions();

  const firstName = (user?.display_name || user?.full_name || 'Staff').split(' ')[0];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 text-left">
      {/* Overview Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E0DD]">
        <div>
          <h1 className="greeting-title font-display text-3xl sm:text-4xl font-semibold text-[#17191A] tracking-tight">
            {getTimeGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-[#5D5E5F] mt-1">
            Clinical operations and care coordination status for today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            Africa/Lagos (WAT, UTC+1)
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Inquiries */}
        {!isEditor && (
          <Link
            to="/inquiries"
            className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white hover:border-[#17645F] transition-all shadow-xs space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider">
                New Inquiries
              </span>
              <div className="w-8 h-8 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center">
                <MessageDotsSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-[#17191A]">3</span>
              <Badge variant="success" size="sm">
                +1 today
              </Badge>
            </div>
          </Link>
        )}

        {/* Metric 2: Applications */}
        {!isEditor && (
          <Link
            to="/applications"
            className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white hover:border-[#17645F] transition-all shadow-xs space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider">
                Pending Applications
              </span>
              <div className="w-8 h-8 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center">
                <File02 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-[#17191A]">2</span>
              <Badge variant="warning" size="sm">
                Screening
              </Badge>
            </div>
          </Link>
        )}

        {/* Metric 3: Bookings */}
        {!isEditor && (
          <Link
            to="/bookings"
            className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white hover:border-[#17645F] transition-all shadow-xs space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider">
                Upcoming This Week
              </span>
              <div className="w-8 h-8 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-[#17191A]">4</span>
              <span className="text-xs text-[#5D5E5F]">Confirmed</span>
            </div>
          </Link>
        )}

        {/* Metric 4: Reviews */}
        {!isCoordinator && (
          <Link
            to="/reviews"
            className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white hover:border-[#17645F] transition-all shadow-xs space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider">
                Pending Reviews
              </span>
              <div className="w-8 h-8 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center">
                <Star01 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-[#17191A]">1</span>
              <Badge variant="warning" size="sm">
                Moderation
              </Badge>
            </div>
          </Link>
        )}
      </div>

      {/* Charts & Visual Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Bookings Chart */}
        <div className="lg:col-span-7 bg-white border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-[#17191A]">Consultation Volume</h3>
              <p className="text-xs text-[#5D5E5F]">Completed and upcoming bookings over past 4 weeks</p>
            </div>
            <Badge variant="brand" size="sm">
              <TrendUp01 className="w-3.5 h-3.5 inline mr-1" />
              +18% MoM
            </Badge>
          </div>

          {/* Bar Chart Visualization in Deep Teal */}
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2 border-b border-[#E1E0DD]">
            {[
              { label: 'Week 1', count: 6, height: '40%' },
              { label: 'Week 2', count: 9, height: '60%' },
              { label: 'Week 3', count: 12, height: '80%' },
              { label: 'Current Week', count: 14, height: '95%' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-semibold text-[#17645F]">{bar.count}</span>
                <div
                  className="w-full max-w-[48px] bg-[#17645F] hover:bg-[#155A56] rounded-t-[4px] transition-all"
                  style={{ height: bar.height }}
                />
                <span className="text-[11px] text-[#5D5E5F] truncate">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiries by Source Donut/Pie Breakdown */}
        <div className="lg:col-span-5 bg-white border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-semibold text-base text-[#17191A]">Inquiries by Source</h3>
            <p className="text-xs text-[#5D5E5F]">Acquisition channels for prospective parents</p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { source: 'Website Contact Form', share: '52%', count: 18, color: 'bg-[#17645F]' },
              { source: 'Physician / Clinic Referral', share: '24%', count: 8, color: 'bg-[#2E746F]' },
              { source: 'International Search', share: '16%', count: 5, color: 'bg-[#5D928F]' },
              { source: 'Word of Mouth / Alumni', share: '8%', count: 3, color: 'bg-[#8BB2AF]' },
            ].map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#17191A]">{s.source}</span>
                  <span className="font-mono text-[#5D5E5F]">{s.share}</span>
                </div>
                <div className="w-full bg-[#E1E0DD] h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color}`} style={{ width: s.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Agenda & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-6 bg-white border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#17645F]" />
              <h3 className="font-semibold text-base text-[#17191A]">Today&apos;s Appointments</h3>
            </div>
            <Link to="/bookings" className="text-xs text-[#17645F] font-semibold hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                time: '10:00 WAT',
                name: 'Parent AJ',
                type: 'Intended Parent Consultation',
                channel: 'Google Meet',
                status: 'confirmed',
              },
              {
                time: '14:00 WAT',
                name: 'Blessing O.',
                type: 'Surrogate Information Call',
                channel: 'WhatsApp call',
                status: 'pending',
              },
            ].map((apt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[8px] border border-[#E1E0DD] bg-[#FAF9F6] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-semibold text-[#17645F]">{apt.time}</span>
                  <p className="text-sm font-semibold text-[#17191A]">{apt.name}</p>
                  <p className="text-xs text-[#5D5E5F]">{apt.type} · {apt.channel}</p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-6 bg-white border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs space-y-4">
          <h3 className="font-semibold text-base text-[#17191A]">Recent Activity Trail</h3>

          <div className="space-y-3.5">
            {[
              {
                action: 'New Inquiry Received',
                detail: 'Olumide & Sarah A. submitted a cost estimate inquiry.',
                time: '2 hours ago',
              },
              {
                action: 'Surrogate Application Filed',
                detail: 'Faith M. (Lagos) completed screening questionnaire.',
                time: '4 hours ago',
              },
              {
                action: 'Review Story Submitted',
                detail: 'Anonymous Donor submitted a 5-star reflection.',
                time: 'Yesterday',
              },
            ].map((act, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs pb-3 border-b border-[#E1E0DD] last:border-b-0">
                <div className="w-2 h-2 rounded-full bg-[#17645F] mt-1.5 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <p className="font-semibold text-[#17191A]">{act.action}</p>
                  <p className="text-[#5D5E5F]">{act.detail}</p>
                </div>
                <span className="font-mono text-[11px] text-[#969594]">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
