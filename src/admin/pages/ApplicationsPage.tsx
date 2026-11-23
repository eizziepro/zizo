import React, { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { MaskedValue } from '../components/common/MaskedValue';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Avatar } from '../components/untitledui/Avatar';
import { Badge } from '../components/untitledui/Badge';
import { Button } from '../components/untitledui/Button';
import { Drawer } from '../components/untitledui/Drawer';
import { Modal } from '../components/untitledui/Modal';
import { Input } from '../components/untitledui/Input';
import { Select } from '../components/untitledui/Select';
import { Textarea } from '../components/untitledui/Textarea';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { Plus } from '@untitledui/icons';
import type { Application, ApplicationStatus, ApplicationKind } from '../types';

const STAFF_COORDINATORS = [
  { id: '1', name: 'Chizaram Ata' },
  { id: '2', name: 'Amara Okafor' },
  { id: '3', name: 'Babatunde Adeyemi' },
];

const DEFAULT_SCREENING_CHECKLIST = [
  { id: 'id_verified', label: 'Identity & Age verification completed' },
  { id: 'interview_completed', label: 'Coordinator introductory interview completed' },
  { id: 'medical_clearance', label: 'Partner clinic infectious disease & blood panel cleared' },
  { id: 'psychological_eval', label: 'Independent psychological screening passed' },
  { id: 'legal_counsel', label: 'Surrogacy / Donation agreement orientation conducted' },
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    kind: 'surrogate',
    candidate_code: 'ZZ-S-101',
    name: 'Faith M.',
    email: 'faith.m@example.com',
    phone: '+2348123456789',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    age_range: '26 - 30',
    country: 'Nigeria',
    city: 'Lagos',
    screening_checklist: { id_verified: true, interview_completed: true },
    answers: {
      has_given_birth: 'Yes (2 healthy deliveries)',
      marital_status: 'Married',
      support_network: 'Husband and sister fully supportive',
      non_smoker: 'Yes',
      motivation: 'Desire to help an intended mother hold her baby and support family financial security.',
    },
    status: 'new',
    assigned_to: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    notes: 'Initial questionnaire verified. Ready for coordinator introductory call.',
    created_at: '2026-11-18T00:15:00Z',
  },
  {
    id: 'app-2',
    kind: 'egg_donor',
    candidate_code: 'ZZ-D-204',
    name: 'Kemi B.',
    email: 'kemi.b@example.com',
    phone: '+2348056781234',
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=160&q=80',
    age_range: '21 - 25',
    country: 'Nigeria',
    city: 'Ibadan',
    screening_checklist: { id_verified: true, interview_completed: true, medical_clearance: true },
    answers: {
      education: 'University Graduate (B.Sc Microbiology)',
      blood_group: 'O Positive',
      height: '5 ft 7 in',
      genetic_history: 'No known hereditary conditions',
      motivation: 'Assisting families in need while completing post-graduate education.',
    },
    status: 'in_screening',
    assigned_to: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    notes: 'Screening call completed. Waiting for clinic profile verification.',
    created_at: '2026-11-17T15:20:00Z',
  },
  {
    id: 'app-3',
    kind: 'surrogate',
    candidate_code: 'ZZ-S-103',
    name: 'Ngozi D.',
    email: 'ngozi.d@example.com',
    phone: '+2348077665544',
    avatar_url: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=160&q=80',
    age_range: '31 - 35',
    country: 'Nigeria',
    city: 'Enugu',
    screening_checklist: { id_verified: true, interview_completed: true, medical_clearance: true, psychological_eval: true, legal_counsel: true },
    answers: {
      has_given_birth: 'Yes (1 delivery)',
      marital_status: 'Single',
      support_network: 'Mother and brother',
      non_smoker: 'Yes',
      motivation: 'Helping childless couples achieve parenthood.',
    },
    status: 'approved',
    assigned_to: '1',
    assigned_staff: { full_name: 'Chizaram Ata' },
    notes: 'Approved for matching database.',
    created_at: '2026-11-10T11:00:00Z',
  },
];

export const ApplicationsPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'surrogate' | 'egg_donor'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);

  // Register Candidate state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regKind, setRegKind] = useState<ApplicationKind>('surrogate');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCode, setRegCode] = useState(`ZZ-S-${Math.floor(100 + Math.random() * 900)}`);
  const [regAgeRange, setRegAgeRange] = useState('26 - 30');
  const [regCity, setRegCity] = useState('Lagos');
  const [regCountry, setRegCountry] = useState('Nigeria');
  const [regSource, setRegSource] = useState('Direct clinical outreach');
  const [regCoordinator, setRegCoordinator] = useState('2');
  const [regNotes, setRegNotes] = useState('');

  const handleRegisterCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;

    const assignedStaff = STAFF_COORDINATORS.find((s) => s.id === regCoordinator);
    const newApp: Application = {
      id: `app-${Date.now()}`,
      kind: regKind,
      candidate_code: regCode.trim() || `ZZ-${regKind === 'surrogate' ? 'S' : 'D'}-${Math.floor(100 + Math.random() * 900)}`,
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || '+234 800 000 0000',
      age_range: regAgeRange,
      city: regCity.trim() || 'Lagos',
      country: regCountry.trim() || 'Nigeria',
      status: 'new',
      assigned_to: regCoordinator,
      assigned_staff: assignedStaff ? { full_name: assignedStaff.name } : null,
      notes: regNotes.trim() || 'Manually registered via coordinator portal.',
      source: regSource,
      answers: {
        motivation: 'Candidate registered through clinical coordinator intake.',
        screening_mode: 'In-person / Clinical review',
      },
      screening_checklist: { id_verified: true },
      created_at: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);
    logAction({
      action: 'REGISTER_CANDIDATE',
      tableName: 'applications',
      recordId: newApp.id,
      diff: { name: newApp.name, kind: newApp.kind, code: newApp.candidate_code },
    });
    toast('Candidate Registered', `${newApp.name} (${newApp.candidate_code}) added to candidate roster.`, 'success');
    setIsRegisterModalOpen(false);
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegNotes('');
    setRegCode(`ZZ-${regKind === 'surrogate' ? 'S' : 'D'}-${Math.floor(100 + Math.random() * 900)}`);
  };

  // Filter applications by kind and status
  const filteredApps = applications.filter((app) => {
    if (activeTab !== 'all' && app.kind !== activeTab) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setSelectedApp(null);
    logAction({
      action: 'UPDATE_APPLICATION_STATUS',
      tableName: 'applications',
      recordId: id,
      diff: { status },
    });
    toast('Application Updated', `Status changed to ${status.replace('_', ' ')}.`, 'success');
  };

  const handleDelete = () => {
    if (!appToDelete) return;
    setApplications((prev) => prev.filter((a) => a.id !== appToDelete.id));
    logAction({
      action: 'DELETE_APPLICATION',
      tableName: 'applications',
      recordId: appToDelete.id,
    });
    toast('Deleted', 'Application record deleted.', 'info');
    setAppToDelete(null);
  };

  const columns = React.useMemo<ColumnDef<Application>[]>(
    () => [
      {
        id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="w-4 h-4 accent-[#17645F]"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 accent-[#17645F]"
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Applicant',
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-[160px]">
            <Avatar src={app.avatar_url} name={app.name} size="sm" />
            <div className="truncate max-w-[160px]">
              <p className="font-semibold text-sm text-[#17191A] truncate">{app.name}</p>
              <MaskedValue value={app.email} type="email" tableName="applications" recordId={app.id} />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'candidate_code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-[#17645F] bg-[#E2ECEB]/60 px-1.5 py-0.5 rounded border border-[#C5D8D7]">
          {row.original.candidate_code || 'UNASSIGNED'}
        </span>
      ),
    },
    {
      accessorKey: 'kind',
      header: 'Kind',
      cell: ({ row }) => (
        <Badge variant={row.original.kind === 'surrogate' ? 'brand' : 'blue'} size="sm">
          {row.original.kind === 'surrogate' ? 'Surrogate' : 'Egg Donor'}
        </Badge>
      ),
    },
    {
      accessorKey: 'age_range',
      header: 'Age Range',
      cell: ({ row }) => <span className="text-xs text-[#17191A] whitespace-nowrap">{row.original.age_range}</span>,
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <span className="text-xs text-[#5D5E5F] whitespace-nowrap">
          {row.original.city}, {row.original.country}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'assigned_staff',
      header: 'Assigned To',
      cell: ({ row }) => (
        <span className="text-xs text-[#5D5E5F] whitespace-nowrap">
          {row.original.assigned_staff?.full_name || 'Unassigned'}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Applied',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-[#5D5E5F] whitespace-nowrap">
          {new Date(row.original.created_at).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="text-right">
            <RowActionsMenu
              rowLabel={`application for ${app.name}`}
              items={[
                {
                  id: 'view',
                  label: 'View application',
                  onClick: () => setSelectedApp(app),
                },
                {
                  id: 'screening',
                  label: 'Move to In Screening',
                  onClick: () => handleStatusChange(app.id, 'in_screening'),
                },
                {
                  id: 'approve',
                  label: 'Approve Application',
                  onClick: () => handleStatusChange(app.id, 'approved'),
                },
                {
                  id: 'waitlist',
                  label: 'Move to Waitlist',
                  onClick: () => handleStatusChange(app.id, 'waitlist'),
                },
                {
                  id: 'decline',
                  label: 'Decline',
                  onClick: () => handleStatusChange(app.id, 'declined'),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  destructive: true,
                  dividerAbove: true,
                  onClick: () => setAppToDelete(app),
                },
              ]}
            />
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Surrogate &amp; Donor Applications"
        description="Confidential initial screening questionnaires submitted by prospective gestational carriers and donors."
        actions={
          <Button
            onClick={() => setIsRegisterModalOpen(true)}
            iconLeading={<Plus className="w-4 h-4" />}
          >
            Register Candidate
          </Button>
        }
      />

      {/* Tabs & Status filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E0DD] pb-3">
        <div className="flex gap-4 text-sm font-medium">
          {(['all', 'surrogate', 'egg_donor'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-2 capitalize border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-[#17645F] text-[#17645F] font-semibold'
                  : 'border-transparent text-[#5D5E5F] hover:text-[#17191A]'
              }`}
            >
              {tab.replace('_', ' ')}s
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5D5E5F]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-[#E1E0DD] bg-white px-2.5 py-1 text-xs text-[#17191A] focus:outline-none focus:ring-1 focus:ring-[#17645F]"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="in_screening">In screening</option>
            <option value="approved">Approved</option>
            <option value="waitlist">Waitlist</option>
            <option value="declined">Declined</option>
            <option value="on_hold">On hold</option>
          </select>
        </div>
      </div>

      <DataTable
        data={filteredApps}
        columns={columns}
        searchPlaceholder="Search applicants by location, age, answers..."
        onRowClick={(row) => setSelectedApp(row)}
        emptyState={{
          title: 'No applications found',
          description: `No ${activeTab} applications match the selected criteria.`,
        }}
      />

      {/* Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title="Application Dossier"
        description={`${selectedApp?.kind === 'surrogate' ? 'Gestational Surrogate' : 'Ovum Donor'} questionnaire`}
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Application Status</span>
                <StatusBadge status={selectedApp.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Program</span>
                <Badge variant={selectedApp.kind === 'surrogate' ? 'brand' : 'blue'} size="sm">
                  {selectedApp.kind.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Candidate Code</span>
                <span className="font-mono text-xs font-bold text-[#17645F] bg-[#E2ECEB] px-2 py-0.5 rounded border border-[#C5D8D7]">
                  {selectedApp.candidate_code || 'UNASSIGNED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Age Range</span>
                <span className="text-xs font-semibold text-[#17191A]">{selectedApp.age_range}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Location</span>
                <span className="text-xs text-[#17191A]">{selectedApp.city}, {selectedApp.country}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E1E0DD]">
                <span className="text-xs text-[#5D5E5F]">Assigned Coordinator</span>
                <select
                  value={selectedApp.assigned_to || '2'}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const nextStaff = STAFF_COORDINATORS.find((s) => s.id === nextId);
                    setApplications((prev) =>
                      prev.map((a) =>
                        a.id === selectedApp.id
                          ? { ...a, assigned_to: nextId, assigned_staff: nextStaff ? { full_name: nextStaff.name } : null }
                          : a
                      )
                    );
                    setSelectedApp((prev) =>
                      prev
                        ? { ...prev, assigned_to: nextId, assigned_staff: nextStaff ? { full_name: nextStaff.name } : null }
                        : null
                    );
                    toast('Coordinator Assigned', `Assigned to ${nextStaff?.name}.`, 'success');
                  }}
                  className="rounded border border-[#E1E0DD] bg-white px-2 py-1 text-xs text-[#17191A] font-medium focus:ring-1 focus:ring-[#17645F] cursor-pointer"
                >
                  {STAFF_COORDINATORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Strict Notice regarding medical data */}
            <div className="p-3.5 rounded-[8px] bg-[#E2ECEB] border border-[#C5D8D7] text-xs text-[#17645F] space-y-1">
              <p className="font-semibold">Privacy &amp; Medical Protocol</p>
              <p>
                Medical diagnostic records and official national IDs are collected exclusively through the later coordinator-led secure clinical intake process, never via web forms.
              </p>
            </div>

            {/* Masked Contact */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Masked Direct Contact
              </h4>
              <div className="space-y-1.5 p-3 rounded-[8px] border border-[#E1E0DD]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D5E5F]">Email</span>
                  <MaskedValue value={selectedApp.email} type="email" tableName="applications" recordId={selectedApp.id} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D5E5F]">Phone</span>
                  <MaskedValue value={selectedApp.phone} type="phone" tableName="applications" recordId={selectedApp.id} />
                </div>
              </div>
            </div>

            {/* Interactive Clinical Screening Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                  Clinical Screening Milestones
                </h4>
                <span className="text-[11px] text-[#5D5E5F]">Click step to update record</span>
              </div>
              <div className="divide-y divide-[#E1E0DD] border border-[#E1E0DD] rounded-[8px] bg-white overflow-hidden shadow-xs">
                {DEFAULT_SCREENING_CHECKLIST.map((step) => {
                  const isChecked = Boolean(selectedApp.screening_checklist?.[step.id]);
                  return (
                    <label
                      key={step.id}
                      className="p-3 flex items-center gap-3 cursor-pointer hover:bg-[#FAF9F6] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const nextChecklist = {
                            ...(selectedApp.screening_checklist || {}),
                            [step.id]: !isChecked,
                          };
                          setApplications((prev) =>
                            prev.map((a) =>
                              a.id === selectedApp.id ? { ...a, screening_checklist: nextChecklist } : a
                            )
                          );
                          setSelectedApp((prev) => (prev ? { ...prev, screening_checklist: nextChecklist } : null));
                          toast('Screening Step Updated', step.label, 'info');
                        }}
                        className="w-4 h-4 accent-[#17645F] cursor-pointer shrink-0"
                      />
                      <span className={`text-xs ${isChecked ? 'text-[#17191A] font-medium' : 'text-[#5D5E5F]'}`}>
                        {step.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submitted Answers */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Submitted Questionnaire Answers
              </h4>
              <div className="divide-y divide-[#E1E0DD] border border-[#E1E0DD] rounded-[8px] bg-white">
                {Object.entries(selectedApp.answers).map(([k, v]) => (
                  <div key={k} className="p-3 text-xs space-y-1">
                    <p className="font-semibold text-[#5D5E5F] capitalize">{k.replace(/_/g, ' ')}</p>
                    <p className="text-[#17191A]">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Internal Coordinator Notes
              </h4>
              <Textarea
                rows={3}
                value={selectedApp.notes || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedApp((prev) => prev ? { ...prev, notes: val } : null);
                  setApplications((prev) =>
                    prev.map((a) => (a.id === selectedApp.id ? { ...a, notes: val } : a))
                  );
                }}
                placeholder="Log screening call feedback or coordinator updates..."
              />
            </div>

            <div className="pt-4 border-t border-[#E1E0DD] flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange(selectedApp.id, 'in_screening')}
              >
                Move to Screening
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange(selectedApp.id, 'approved')}
              >
                Approve Candidate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusChange(selectedApp.id, 'declined')}
              >
                Decline
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Register Candidate Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        maxWidth="2xl"
        title="Register Medical Candidate"
        description="Onboard a verified gestational carrier or ovum donor candidate into clinical screening."
      >
        <form onSubmit={handleRegisterCandidate} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Candidate Program"
              value={regKind}
              onChange={(e) => {
                const k = e.target.value as ApplicationKind;
                setRegKind(k);
                setRegCode(`ZZ-${k === 'surrogate' ? 'S' : 'D'}-${Math.floor(100 + Math.random() * 900)}`);
              }}
              options={[
                { value: 'surrogate', label: 'Gestational Surrogate Carrier' },
                { value: 'egg_donor', label: 'Ovum / Egg Donor Candidate' },
              ]}
            />
            <Input
              label="Confidential Candidate Code"
              required
              value={regCode}
              onChange={(e) => setRegCode(e.target.value)}
              placeholder="e.g. ZZ-S-105"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Candidate Full Name"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Blessing O."
            />
            <Select
              label="Age Range"
              value={regAgeRange}
              onChange={(e) => setRegAgeRange(e.target.value)}
              options={[
                { value: '21 - 25', label: '21 - 25 years' },
                { value: '26 - 30', label: '26 - 30 years' },
                { value: '31 - 35', label: '31 - 35 years' },
                { value: '36 - 40', label: '36 - 40 years' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="candidate@example.com"
            />
            <Input
              label="Phone Number / WhatsApp"
              type="tel"
              required
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="+234..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City / State"
              value={regCity}
              onChange={(e) => setRegCity(e.target.value)}
              placeholder="Lagos"
            />
            <Select
              label="Country"
              value={regCountry}
              onChange={(e) => setRegCountry(e.target.value)}
              options={[
                { value: 'Nigeria', label: 'Nigeria' },
                { value: 'Ghana', label: 'Ghana' },
                { value: 'Kenya', label: 'Kenya' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Select
              label="Recruitment Source"
              value={regSource}
              onChange={(e) => setRegSource(e.target.value)}
              options={[
                { value: 'Direct clinical outreach', label: 'Direct clinical outreach' },
                { value: 'Partner Clinic Referral', label: 'Partner Clinic Referral' },
                { value: 'Website application', label: 'Website application' },
                { value: 'Community recommendation', label: 'Community recommendation' },
              ]}
            />
          </div>

          <Select
            label="Assigned Lead Coordinator"
            value={regCoordinator}
            onChange={(e) => setRegCoordinator(e.target.value)}
            options={STAFF_COORDINATORS.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
          />

          <Textarea
            label="Initial Clinical Assessment &amp; Intake Notes"
            rows={2}
            value={regNotes}
            onChange={(e) => setRegNotes(e.target.value)}
            placeholder="Parity history, physical health notes, or coordinator observations..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E0DD]">
            <Button variant="secondary" type="button" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Candidate
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(appToDelete)}
        onClose={() => setAppToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Application Record"
        description={`Are you sure you want to delete the application dossier for ${appToDelete?.name}?`}
        confirmLabel="Delete Application"
      />
    </div>
  );
};
