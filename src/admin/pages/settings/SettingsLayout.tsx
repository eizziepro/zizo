import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { PageHeader } from '../../components/untitledui/PageHeader';
import { usePermissions } from '../../hooks/usePermissions';

export const SettingsLayout: React.FC = () => {
  const { isOwner, isCoordinator } = usePermissions();

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      isActive
        ? 'border-[#17645F] text-[#17645F] font-semibold'
        : 'border-transparent text-[#5D5E5F] hover:text-[#17191A] hover:border-[#C8C7C5]'
    }`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings &amp; Preferences"
        description="Manage your staff profile, credentials, organization configurations, and clinic availability."
        breadcrumbs={[{ label: 'Staff Portal', href: '/admin/' }, { label: 'Settings' }]}
      />

      {/* Tabs navigation */}
      <div className="border-b border-[#E1E0DD] overflow-x-auto">
        <nav className="flex gap-2" aria-label="Settings tabs">
          <NavLink to="/admin/settings/profile" className={tabClass}>
            Profile
          </NavLink>
          <NavLink to="/admin/settings/security" className={tabClass}>
            Security
          </NavLink>
          {isOwner && (
            <NavLink to="/admin/settings/site" className={tabClass}>
              Site Settings
            </NavLink>
          )}
          {(isOwner || isCoordinator) && (
            <NavLink to="/admin/settings/availability" className={tabClass}>
              Availability
            </NavLink>
          )}
          <NavLink to="/admin/settings/notifications" className={tabClass}>
            Notifications
          </NavLink>
          {isOwner && (
            <NavLink to="/admin/settings/team" className={tabClass}>
              Team &amp; Roles
            </NavLink>
          )}
        </nav>
      </div>

      {/* Tab content view */}
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
};
