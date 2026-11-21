import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Button } from '../../components/untitledui/Button';
import { Input } from '../../components/untitledui/Input';
import { Select } from '../../components/untitledui/Select';
import { Badge } from '../../components/untitledui/Badge';
import { Modal } from '../../components/untitledui/Modal';
import { RowActionsMenu } from '../../components/common/RowActionsMenu';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Avatar } from '../../components/untitledui/Avatar';
import { Plus, User01 } from '@untitledui/icons';
import type { StaffProfile, StaffRole } from '../../types';

const INITIAL_TEAM: StaffProfile[] = [
  {
    id: '1',
    user_id: 'u1',
    email: 'owner@zizodonorandsurrogacy.com',
    full_name: 'Chizaram Ata',
    display_name: 'Chizaram',
    avatar_path: '/assets/img/founder-about-chizaram-ata-640w.webp',
    role: 'owner',
    active: true,
    job_title: 'Clinical Director & Founder',
    department: 'Leadership',
    timezone: 'Africa/Lagos',
    language: 'en',
    totp_enabled: true,
    last_active: 'Just now',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'u2',
    email: 'coordinator@zizodonorandsurrogacy.com',
    full_name: 'Amara Okafor',
    display_name: 'Amara',
    avatar_path: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80',
    role: 'coordinator',
    active: true,
    job_title: 'Senior Surrogacy Coordinator',
    department: 'Client Services',
    timezone: 'Africa/Lagos',
    language: 'en',
    totp_enabled: true,
    last_active: '2 hours ago',
    created_at: '2026-02-01T12:00:00Z',
  },
  {
    id: '3',
    user_id: 'u3',
    email: 'editor@zizodonorandsurrogacy.com',
    full_name: 'Tunde Bakare',
    display_name: 'Tunde',
    avatar_path: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    role: 'editor',
    active: true,
    job_title: 'Medical Content Specialist',
    department: 'Communications',
    timezone: 'Africa/Lagos',
    language: 'en',
    totp_enabled: true,
    last_active: 'Yesterday',
    created_at: '2026-02-15T09:30:00Z',
  },
];

export const TeamTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [team, setTeam] = useState<StaffProfile[]>(INITIAL_TEAM);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('coordinator');

  // Deactivate confirmation
  const [staffToDeactivate, setStaffToDeactivate] = useState<StaffProfile | null>(null);

  const ownerCount = team.filter((s) => s.role === 'owner' && s.active).length;

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: StaffProfile = {
      id: 'staff-' + Date.now(),
      user_id: 'u-' + Date.now(),
      email: inviteEmail.trim().toLowerCase(),
      full_name: inviteName.trim(),
      role: inviteRole,
      active: true,
      timezone: 'Africa/Lagos',
      language: 'en',
      totp_enabled: false,
      last_active: 'Invited',
      created_at: new Date().toISOString(),
    };

    setTeam((prev) => [...prev, newStaff]);
    await logAction({
      action: 'INVITE_STAFF',
      tableName: 'staff',
      recordId: newStaff.id,
      diff: { email: newStaff.email, role: newStaff.role },
    });

    toast('Invitation Dispatched', `Staff invite sent to ${newStaff.email}.`, 'success');
    setInviteModalOpen(false);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('coordinator');
  };

  const handleDeactivate = async () => {
    if (!staffToDeactivate) return;

    if (staffToDeactivate.role === 'owner' && ownerCount <= 1) {
      toast('Operation Blocked', 'You cannot deactivate the last remaining Owner.', 'error');
      setStaffToDeactivate(null);
      return;
    }

    setTeam((prev) =>
      prev.map((s) => (s.id === staffToDeactivate.id ? { ...s, active: false } : s))
    );

    await logAction({
      action: 'DEACTIVATE_STAFF',
      tableName: 'staff',
      recordId: staffToDeactivate.id,
    });

    toast('Staff Deactivated', `${staffToDeactivate.full_name} was deactivated.`, 'info');
    setStaffToDeactivate(null);
  };

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#17191A]">Staff Accounts &amp; Permissions</h3>
          <p className="text-xs text-[#5D5E5F] mt-0.5">
            Manage clinical staff roles, MFA compliance, and system invitations.
          </p>
        </div>
        <Button
          onClick={() => setInviteModalOpen(true)}
          iconLeading={<Plus className="w-4 h-4" />}
          size="sm"
        >
          Invite Staff Member
        </Button>
      </div>

      {/* Team Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs">
          <p className="text-xs text-[#5D5E5F]">Total Staff</p>
          <p className="text-xl font-semibold text-[#17191A] mt-1">{team.length}</p>
        </div>
        <div className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs">
          <p className="text-xs text-[#5D5E5F]">Active Coordinators</p>
          <p className="text-xl font-semibold text-[#17645F] mt-1">
            {team.filter((t) => t.role === 'coordinator' && t.active).length}
          </p>
        </div>
        <div className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs">
          <p className="text-xs text-[#5D5E5F]">Clinical Editors</p>
          <p className="text-xl font-semibold text-[#17191A] mt-1">
            {team.filter((t) => t.role === 'editor' && t.active).length}
          </p>
        </div>
        <div className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs">
          <p className="text-xs text-[#5D5E5F]">2FA Enrolled</p>
          <p className="text-xl font-semibold text-[#2E7D32] mt-1">100%</p>
        </div>
      </div>

      <div className="rounded-[10px] border border-[#E1E0DD] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2E3031]">
            <thead className="bg-[#FAF9F6] text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider border-b border-[#E1E0DD]">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">Staff Member</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Role</th>
                <th className="px-4 py-3.5 whitespace-nowrap">2FA Status</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Last Active</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E0DD] bg-white">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar src={member.avatar_path} name={member.full_name} size="sm" />
                      <div>
                        <p className="font-semibold text-sm text-[#17191A] whitespace-nowrap">{member.full_name}</p>
                        <p className="text-xs text-[#5D5E5F] whitespace-nowrap">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge variant={member.role === 'owner' ? 'brand' : 'gray'} size="sm">
                      {member.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge variant={member.totp_enabled ? 'success' : 'warning'} size="sm">
                      {member.totp_enabled ? 'Enrolled' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#5D5E5F] whitespace-nowrap">{member.last_active}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge variant={member.active ? 'success' : 'error'} size="sm">
                      {member.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <RowActionsMenu
                      rowLabel={member.full_name}
                      items={[
                        {
                          id: 'resend',
                          label: 'Resend Invitation',
                          onClick: () => toast('Invite Sent', `Resent invite to ${member.email}`, 'info'),
                        },
                        {
                          id: 'reset-2fa',
                          label: 'Reset 2FA',
                          onClick: () => toast('2FA Reset', `Requested 2FA reset for ${member.full_name}`, 'warning'),
                        },
                        {
                          id: 'deactivate',
                          label: 'Deactivate',
                          destructive: true,
                          dividerAbove: true,
                          disabled: member.role === 'owner' && ownerCount <= 1,
                          onClick: () => setStaffToDeactivate(member),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite New Staff Member"
        description="Dispatch an onboarding email with an invitation link to set up credentials and 2FA."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="e.g. Dr. Ngozi Eze"
          />
          <Input
            label="Staff Email"
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="coordinator@zizodonorandsurrogacy.com"
          />
          <Select
            label="Role &amp; System Permissions"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as StaffRole)}
            options={[
              { value: 'coordinator', label: 'Coordinator (Clients, Bookings, Availability)' },
              { value: 'editor', label: 'Editor (Services, Blog, FAQs, Reviews)' },
              { value: 'owner', label: 'Owner (Full administrative authority)' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-[#E1E0DD]">
            <Button variant="secondary" type="button" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Invitation</Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Modal */}
      <ConfirmModal
        isOpen={Boolean(staffToDeactivate)}
        onClose={() => setStaffToDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Staff Account"
        description={`Are you sure you want to revoke staff portal access for ${staffToDeactivate?.full_name}?`}
        confirmLabel="Deactivate Account"
      />
    </div>
  );
};
