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
import { Plus, ShieldTick, Edit01 } from '@untitledui/icons';
import type { StaffProfile } from '../../types';

export interface PermissionOption {
  id: string;
  label: string;
  category: 'Content & Publishing' | 'Clinical & Inquiries' | 'Settings & Administration';
  description: string;
  isDefaultEditor: boolean;
}

export const PERMISSION_OPTIONS: PermissionOption[] = [
  // Content & Publishing (Default for Editor)
  {
    id: 'services',
    label: 'Services & Programs',
    category: 'Content & Publishing',
    description: 'Create and update surrogacy programs, donor packages, and pricing.',
    isDefaultEditor: true,
  },
  {
    id: 'blog',
    label: 'Blog & Articles',
    category: 'Content & Publishing',
    description: 'Draft, edit, schedule, and publish clinical articles.',
    isDefaultEditor: true,
  },
  {
    id: 'faqs',
    label: 'FAQs & Guidance',
    category: 'Content & Publishing',
    description: 'Maintain patient answers and medical FAQs.',
    isDefaultEditor: true,
  },
  {
    id: 'reviews',
    label: 'Reviews & Stories',
    category: 'Content & Publishing',
    description: 'Moderate, verify, and publish family testimonials.',
    isDefaultEditor: true,
  },

  // Clinical & Operations
  {
    id: 'inquiries',
    label: 'Client Inquiries',
    category: 'Clinical & Inquiries',
    description: 'Manage prospective intended parent questions and inbound leads.',
    isDefaultEditor: false,
  },
  {
    id: 'applications',
    label: 'Surrogate & Donor Applications',
    category: 'Clinical & Inquiries',
    description: 'Access screening dossiers, intake answers, and medical milestones.',
    isDefaultEditor: false,
  },
  {
    id: 'bookings',
    label: 'Consultation Bookings',
    category: 'Clinical & Inquiries',
    description: 'View and manage scheduled client appointments and video meetings.',
    isDefaultEditor: false,
  },
  {
    id: 'consultation-types',
    label: 'Consultation Types',
    category: 'Clinical & Inquiries',
    description: 'Configure consultation packages, channels, and pricing.',
    isDefaultEditor: false,
  },
  {
    id: 'subscribers',
    label: 'Newsletter Subscribers',
    category: 'Clinical & Inquiries',
    description: 'View and export subscriber contact list.',
    isDefaultEditor: false,
  },

  // Settings & Administration
  {
    id: 'settings:availability',
    label: 'Availability & Calendar',
    category: 'Settings & Administration',
    description: 'Set weekly consultation schedules, buffer times, and exceptions.',
    isDefaultEditor: false,
  },
  {
    id: 'settings:site',
    label: 'Site & Brand Settings',
    category: 'Settings & Administration',
    description: 'Manage clinic phone numbers, emails, addresses, and SEO.',
    isDefaultEditor: false,
  },
  {
    id: 'settings:integrations',
    label: 'Payment & API Integrations',
    category: 'Settings & Administration',
    description: 'Manage Paystack, Remita, and CRM credentials and webhooks.',
    isDefaultEditor: false,
  },
  {
    id: 'audit-log',
    label: 'Security & Audit Logs',
    category: 'Settings & Administration',
    description: 'Inspect full audit trails and staff login activity.',
    isDefaultEditor: false,
  },
];

export const DEFAULT_EDITOR_PERMISSIONS = PERMISSION_OPTIONS.filter((p) => p.isDefaultEditor).map((p) => p.id);
export const ALL_PERMISSIONS = PERMISSION_OPTIONS.map((p) => p.id);

const STORAGE_KEY = 'zizo_staff_team';

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
    permissions: ALL_PERMISSIONS,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'u2',
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
    permissions: ['services', 'blog', 'faqs', 'reviews'],
    created_at: '2026-02-15T09:30:00Z',
  },
  {
    id: '3',
    user_id: 'u3',
    email: 'amara@zizodonorandsurrogacy.com',
    full_name: 'Amara Okafor',
    display_name: 'Amara',
    avatar_path: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80',
    role: 'editor',
    active: true,
    job_title: 'Senior Clinical Intake Specialist',
    department: 'Client Services',
    timezone: 'Africa/Lagos',
    language: 'en',
    totp_enabled: true,
    last_active: '2 hours ago',
    permissions: ['services', 'blog', 'faqs', 'reviews', 'inquiries', 'applications'],
    created_at: '2026-02-01T12:00:00Z',
  },
];

export const TeamTab: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  // Load team from localStorage if available, or fall back to INITIAL_TEAM
  const [team, setTeam] = useState<StaffProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any) => ({
            ...m,
            role: m.role === 'coordinator' ? 'editor' : m.role,
            permissions: m.permissions || (m.role === 'owner' ? ALL_PERMISSIONS : DEFAULT_EDITOR_PERMISSIONS),
          }));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_TEAM;
  });

  // Sync team updates to localStorage
  const saveTeam = (updated: StaffProfile[]) => {
    setTeam(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist team to localStorage:', e);
    }
  };

  // --- Invite Modal State ---
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'owner'>('editor');
  const [invitePermissions, setInvitePermissions] = useState<string[]>(DEFAULT_EDITOR_PERMISSIONS);

  // --- Edit Staff & Permissions Modal State ---
  const [staffToEdit, setStaffToEdit] = useState<StaffProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'editor' | 'owner'>('editor');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);

  // --- Deactivate confirmation State ---
  const [staffToDeactivate, setStaffToDeactivate] = useState<StaffProfile | null>(null);

  const ownerCount = team.filter((s) => s.role === 'owner' && s.active).length;

  const handleOpenInvite = () => {
    setInviteName('');
    setInviteEmail('');
    setInviteRole('editor');
    setInvitePermissions(DEFAULT_EDITOR_PERMISSIONS);
    setInviteModalOpen(true);
  };

  const handleToggleInvitePermission = (permId: string) => {
    setInvitePermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const granted = inviteRole === 'owner' ? ALL_PERMISSIONS : invitePermissions;

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
      permissions: granted,
      created_at: new Date().toISOString(),
    };

    const nextTeam = [...team, newStaff];
    saveTeam(nextTeam);

    await logAction({
      action: 'INVITE_STAFF',
      tableName: 'staff',
      recordId: newStaff.id,
      diff: { email: newStaff.email, role: newStaff.role, permissions: granted },
    });

    toast('Invitation Dispatched', `Staff invite dispatched to ${newStaff.email} with ${granted.length} permissions.`, 'success');
    setInviteModalOpen(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (member: StaffProfile) => {
    setStaffToEdit(member);
    setEditName(member.full_name);
    setEditRole(member.role === 'owner' ? 'owner' : 'editor');
    setEditPermissions(member.permissions && member.permissions.length > 0 ? member.permissions : DEFAULT_EDITOR_PERMISSIONS);
    setEditActive(member.active);
  };

  const handleToggleEditPermission = (permId: string) => {
    setEditPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToEdit) return;

    if (staffToEdit.role === 'owner' && editRole !== 'owner' && ownerCount <= 1) {
      toast('Operation Blocked', 'You cannot downgrade the last remaining Owner account.', 'error');
      return;
    }

    const granted = editRole === 'owner' ? ALL_PERMISSIONS : editPermissions;

    const updated = team.map((member) => {
      if (member.id === staffToEdit.id) {
        return {
          ...member,
          full_name: editName.trim() || member.full_name,
          role: editRole,
          active: editActive,
          permissions: granted,
        };
      }
      return member;
    });

    saveTeam(updated);

    // If the edited member is the currently logged in user, sync their active context
    if (user && user.id === staffToEdit.id) {
      const updatedProfile = {
        ...user,
        full_name: editName.trim() || user.full_name,
        role: editRole,
        active: editActive,
        permissions: granted,
      };
      try {
        localStorage.setItem('zizo_local_staff', JSON.stringify(updatedProfile));
        if (updateProfile) {
          updateProfile(updatedProfile);
        }
      } catch {
        // ignore
      }
    }

    await logAction({
      action: 'UPDATE_STAFF_PERMISSIONS',
      tableName: 'staff',
      recordId: staffToEdit.id,
      diff: { full_name: editName, role: editRole, permissions: granted, active: editActive },
    });

    toast('Permissions Saved', `Permissions and role updated for ${editName}.`, 'success');
    setStaffToEdit(null);
  };

  const handleDeactivate = async () => {
    if (!staffToDeactivate) return;

    if (staffToDeactivate.role === 'owner' && ownerCount <= 1) {
      toast('Operation Blocked', 'You cannot deactivate the last remaining Owner.', 'error');
      setStaffToDeactivate(null);
      return;
    }

    const updated = team.map((s) => (s.id === staffToDeactivate.id ? { ...s, active: false } : s));
    saveTeam(updated);

    await logAction({
      action: 'DEACTIVATE_STAFF',
      tableName: 'staff',
      recordId: staffToDeactivate.id,
    });

    toast('Staff Deactivated', `${staffToDeactivate.full_name} was deactivated.`, 'info');
    setStaffToDeactivate(null);
  };

  // Group permissions by category
  const categories = ['Content & Publishing', 'Clinical & Inquiries', 'Settings & Administration'] as const;

  return (
    <div className="space-y-6 w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#17191A]">Staff Accounts &amp; Permissions</h3>
          <p className="text-xs text-[#5D5E5F] mt-0.5">
            Owner invites editors with modular permission controls (Services, Blog, FAQs, Reviews by default).
          </p>
        </div>
        <Button
          onClick={handleOpenInvite}
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
          <p className="text-xs text-[#5D5E5F]">Active Owners</p>
          <p className="text-xl font-semibold text-[#17645F] mt-1">
            {team.filter((t) => t.role === 'owner' && t.active).length}
          </p>
        </div>
        <div className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs">
          <p className="text-xs text-[#5D5E5F]">Content &amp; Clinical Editors</p>
          <p className="text-xl font-semibold text-[#17191A] mt-1">
            {team.filter((t) => t.role === 'editor' && t.active).length}
          </p>
        </div>
        <div className="p-4 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xs">
          <p className="text-xs text-[#5D5E5F]">2FA Enrolled</p>
          <p className="text-xl font-semibold text-[#2E7D32] mt-1">100%</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-[10px] border border-[#E1E0DD] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2E3031]">
            <thead className="bg-[#FAF9F6] text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider border-b border-[#E1E0DD]">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">Staff Member</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Role</th>
                <th className="px-4 py-3.5">Assigned Permissions</th>
                <th className="px-4 py-3.5 whitespace-nowrap">2FA Status</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Last Active</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E0DD] bg-white">
              {team.map((member) => {
                const perms = member.role === 'owner' ? ALL_PERMISSIONS : (member.permissions || DEFAULT_EDITOR_PERMISSIONS);
                return (
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
                        {member.role === 'owner' ? 'OWNER' : 'EDITOR'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {member.role === 'owner' || perms.length >= ALL_PERMISSIONS.length ? (
                        <span className="inline-flex items-center text-xs text-[#17645F] font-semibold bg-[#8BB2AF]/15 px-2.5 py-1 rounded-md">
                          Full access
                        </span>
                      ) : perms.length === 0 ? (
                        <span className="text-xs text-[#5D5E5F]">No permissions</span>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1.5 whitespace-nowrap"
                          title={perms.map((pId) => PERMISSION_OPTIONS.find((o) => o.id === pId)?.label || pId).join(', ')}
                        >
                          <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-[#F0EFEC] text-[#2E3031] font-medium border border-[#E1E0DD]">
                            {PERMISSION_OPTIONS.find((o) => o.id === perms[0])?.label || perms[0]}
                          </span>
                          {perms.length > 1 && (
                            <span className="inline-block text-[11px] px-1.5 py-0.5 rounded bg-[#8BB2AF]/20 text-[#17645F] font-semibold">
                              +{perms.length - 1} more
                            </span>
                          )}
                        </div>
                      )}
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
                            id: 'edit-permissions',
                            label: 'Edit Staff & Permissions',
                            icon: <Edit01 className="w-4 h-4 text-[#17645F]" />,
                            onClick: () => handleOpenEdit(member),
                          },
                          {
                            id: 'resend',
                            label: 'Resend Invitation',
                            onClick: () => toast('Invite Sent', `Resent invitation to ${member.email}`, 'info'),
                          },
                          {
                            id: 'reset-2fa',
                            label: 'Reset 2FA',
                            onClick: () => toast('2FA Reset', `Requested 2FA reset for ${member.full_name}`, 'warning'),
                          },
                          {
                            id: 'deactivate',
                            label: member.active ? 'Deactivate' : 'Reactivate',
                            destructive: member.active,
                            dividerAbove: true,
                            disabled: member.role === 'owner' && ownerCount <= 1,
                            onClick: () => setStaffToDeactivate(member),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. INVITE STAFF MODAL (OWNER INVITES EDITOR WITH CUSTOMIZABLE PERMISSIONS) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="2xl"
        title="Invite New Staff Member"
        description="Dispatch an onboarding email. Configure the role and choose granular module permissions."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-5 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Staff Full Name"
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
              placeholder="editor@zizodonorandsurrogacy.com"
            />
          </div>

          <Select
            label="Staff Role"
            value={inviteRole}
            onChange={(e) => {
              const r = e.target.value as 'editor' | 'owner';
              setInviteRole(r);
              if (r === 'editor' && invitePermissions.length === 0) {
                setInvitePermissions(DEFAULT_EDITOR_PERMISSIONS);
              }
            }}
            options={[
              { value: 'editor', label: 'Editor (Customizable Module Permissions)' },
              { value: 'owner', label: 'Owner (Full Administrative Authority across all modules)' },
            ]}
          />

          {/* PERMISSIONS SELECTOR FOR EDITOR */}
          {inviteRole === 'editor' ? (
            <div className="space-y-3 pt-2 border-t border-[#E1E0DD]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#17645F]">
                    Editor Module Permissions
                  </h4>
                  <p className="text-[11px] text-[#5D5E5F]">
                    Services, Blog, FAQs, and Reviews are selected by default. Check additional modules as needed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInvitePermissions(DEFAULT_EDITOR_PERMISSIONS)}
                    className="text-xs text-[#17645F] hover:underline font-medium cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <span className="text-xs text-[#C8C7C5]">·</span>
                  <button
                    type="button"
                    onClick={() => setInvitePermissions(ALL_PERMISSIONS)}
                    className="text-xs text-[#5D5E5F] hover:text-[#17191A] font-medium cursor-pointer"
                  >
                    Select All
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const permsInCat = PERMISSION_OPTIONS.filter((p) => p.category === cat);
                  return (
                    <div key={cat} className="space-y-2">
                      <p className="text-[11px] font-bold text-[#5D5E5F] uppercase tracking-wider bg-[#FAF9F6] px-2.5 py-1 rounded border border-[#E1E0DD]">
                        {cat}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permsInCat.map((opt) => {
                          const isChecked = invitePermissions.includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-[#8BB2AF]/10 border-[#17645F] text-[#17191A] shadow-xs'
                                  : 'bg-white border-[#E1E0DD] text-[#5D5E5F] hover:bg-[#FAF9F6]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleInvitePermission(opt.id)}
                                className="mt-0.5 w-4 h-4 rounded text-[#17645F] focus:ring-[#17645F] accent-[#17645F] cursor-pointer shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`font-semibold ${isChecked ? 'text-[#17645F]' : 'text-[#17191A]'}`}>
                                    {opt.label}
                                  </span>
                                  {opt.isDefaultEditor && (
                                    <span className="text-[9px] uppercase tracking-wide bg-[#8BB2AF]/25 text-[#17645F] px-1.5 py-0.2 rounded font-semibold">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#5D5E5F] mt-0.5 line-clamp-1">{opt.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-[#8BB2AF]/15 border border-[#8BB2AF]/30 flex items-start gap-3 text-xs text-[#17645F]">
              <ShieldTick className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Full Owner Authority</span>
                <p className="text-[11px] text-[#2E3031] mt-0.5">
                  Owners automatically receive unrestricted administrative access across all clinical modules, staff invitations, integration keys, and database operations.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E0DD]">
            <Button variant="secondary" type="button" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Invitation</Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. EDIT STAFF & PERMISSIONS MODAL (OWNER EDITS EXISTING STAFF MEMBER)     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(staffToEdit)}
        onClose={() => setStaffToEdit(null)}
        maxWidth="2xl"
        title="Edit Staff Member &amp; Permissions"
        description={`Update roles and customize modular permissions for ${staffToEdit?.full_name}.`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-5 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Tunde Bakare"
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#17191A] block">Email Address</label>
              <input
                type="email"
                disabled
                value={staffToEdit?.email || ''}
                className="w-full h-10 px-3 text-xs bg-[#F0EFEC] border border-[#E1E0DD] rounded-[8px] text-[#5D5E5F] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Staff Role"
              value={editRole}
              onChange={(e) => {
                const r = e.target.value as 'editor' | 'owner';
                setEditRole(r);
                if (r === 'editor' && editPermissions.length === 0) {
                  setEditPermissions(DEFAULT_EDITOR_PERMISSIONS);
                }
              }}
              options={[
                { value: 'editor', label: 'Editor (Customizable Module Permissions)' },
                { value: 'owner', label: 'Owner (Full Administrative Authority)' },
              ]}
            />
            <Select
              label="Account Status"
              value={editActive ? 'active' : 'inactive'}
              onChange={(e) => setEditActive(e.target.value === 'active')}
              options={[
                { value: 'active', label: 'Active (Permitted to sign in)' },
                { value: 'inactive', label: 'Inactive (Portal access disabled)' },
              ]}
            />
          </div>

          {/* EDIT PERMISSIONS MATRIX */}
          {editRole === 'editor' ? (
            <div className="space-y-3 pt-2 border-t border-[#E1E0DD]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#17645F]">
                    Assigned Module Permissions ({editPermissions.length} active)
                  </h4>
                  <p className="text-[11px] text-[#5D5E5F]">
                    Toggle features this editor is authorized to view, create, or update.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPermissions(DEFAULT_EDITOR_PERMISSIONS)}
                    className="text-xs text-[#17645F] hover:underline font-medium cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <span className="text-xs text-[#C8C7C5]">·</span>
                  <button
                    type="button"
                    onClick={() => setEditPermissions(ALL_PERMISSIONS)}
                    className="text-xs text-[#5D5E5F] hover:text-[#17191A] font-medium cursor-pointer"
                  >
                    Select All
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const permsInCat = PERMISSION_OPTIONS.filter((p) => p.category === cat);
                  return (
                    <div key={cat} className="space-y-2">
                      <p className="text-[11px] font-bold text-[#5D5E5F] uppercase tracking-wider bg-[#FAF9F6] px-2.5 py-1 rounded border border-[#E1E0DD]">
                        {cat}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permsInCat.map((opt) => {
                          const isChecked = editPermissions.includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-[#8BB2AF]/10 border-[#17645F] text-[#17191A] shadow-xs'
                                  : 'bg-white border-[#E1E0DD] text-[#5D5E5F] hover:bg-[#FAF9F6]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleEditPermission(opt.id)}
                                className="mt-0.5 w-4 h-4 rounded text-[#17645F] focus:ring-[#17645F] accent-[#17645F] cursor-pointer shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`font-semibold ${isChecked ? 'text-[#17645F]' : 'text-[#17191A]'}`}>
                                    {opt.label}
                                  </span>
                                  {opt.isDefaultEditor && (
                                    <span className="text-[9px] uppercase tracking-wide bg-[#8BB2AF]/25 text-[#17645F] px-1.5 py-0.2 rounded font-semibold">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#5D5E5F] mt-0.5 line-clamp-1">{opt.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-[#8BB2AF]/15 border border-[#8BB2AF]/30 flex items-start gap-3 text-xs text-[#17645F]">
              <ShieldTick className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Full Owner Authority</span>
                <p className="text-[11px] text-[#2E3031] mt-0.5">
                  Owners automatically receive unrestricted administrative access across all clinical modules, staff invitations, integration keys, and database operations.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E0DD]">
            <Button variant="secondary" type="button" onClick={() => setStaffToEdit(null)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. DEACTIVATE STAFF CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={Boolean(staffToDeactivate)}
        onClose={() => setStaffToDeactivate(null)}
        onConfirm={handleDeactivate}
        title={staffToDeactivate?.active ? 'Deactivate Staff Account' : 'Reactivate Staff Account'}
        description={
          staffToDeactivate?.active
            ? `Are you sure you want to revoke staff portal access for ${staffToDeactivate?.full_name}?`
            : `Are you sure you want to restore staff portal access for ${staffToDeactivate?.full_name}?`
        }
        confirmLabel={staffToDeactivate?.active ? 'Deactivate Account' : 'Reactivate Account'}
      />
    </div>
  );
};
