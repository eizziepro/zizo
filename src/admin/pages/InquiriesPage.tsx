import React, { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { MaskedValue } from '../components/common/MaskedValue';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Avatar } from '../components/untitledui/Avatar';
import { Button } from '../components/untitledui/Button';
import { Drawer } from '../components/untitledui/Drawer';
import { Modal } from '../components/untitledui/Modal';
import { Input } from '../components/untitledui/Input';
import { Select } from '../components/untitledui/Select';
import { Textarea } from '../components/untitledui/Textarea';
import { Badge } from '../components/untitledui/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAuditLog } from '../hooks/useAuditLog';
import { Plus } from '@untitledui/icons';
import type { Inquiry, InquiryStatus } from '../types';

const STAFF_COORDINATORS = [
  { id: '1', name: 'Chizaram Ata' },
  { id: '2', name: 'Amara Okafor' },
  { id: '3', name: 'Babatunde Adeyemi' },
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    type: 'Cost estimate',
    name: 'Olumide & Sarah A.',
    email: 'olumide.a@example.com',
    phone: '+2348039988776',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    source: 'Website form',
    message: 'We are looking for full surrogacy package breakdown including clinic coordination and legal contracts.',
    status: 'new',
    assigned_to: '1',
    assigned_staff: { full_name: 'Chizaram Ata' },
    notes: 'Initial cost breakdown sent via email.',
    created_at: '2026-11-18T01:30:00Z',
  },
  {
    id: 'inq-2',
    type: 'Donor and Surrogate Enquiry',
    name: 'Claire T.',
    email: 'claire.t@example.com',
    phone: '+447911123456',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    country: 'United Kingdom',
    source: 'Google search',
    message: 'Interested in matching with a Nigerian egg donor of Yoruba heritage. Traveling to Lagos in January.',
    status: 'in_progress',
    assigned_to: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    notes: 'Phone call scheduled for next week.',
    created_at: '2026-11-17T11:20:00Z',
  },
  {
    id: 'inq-3',
    type: 'Consultation question',
    name: 'David K.',
    email: 'david.k@example.com',
    phone: '+14155559876',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    country: 'Canada',
    source: 'Referral',
    message: 'Can the consultation be conducted over WhatsApp call due to low bandwidth at my current location?',
    status: 'contacted',
    assigned_to: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    notes: 'Responded affirmative; WhatsApp link sent.',
    created_at: '2026-11-16T09:45:00Z',
  },
];

export const InquiriesPage: React.FC = () => {
  const { toast } = useNotifications();
  const { isOwner } = usePermissions();
  const { logAction } = useAuditLog();

  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacted' | 'in_progress' | 'closed' | 'spam'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);

  // Log Manual Inquiry state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newType, setNewType] = useState('Cost estimate');
  const [newCountry, setNewCountry] = useState('Nigeria');
  const [newPreferredRegion, setNewPreferredRegion] = useState('Lagos');
  const [newSource, setNewSource] = useState('Website form');
  const [newAssignedCoordinator, setNewAssignedCoordinator] = useState('1');
  const [newMessage, setNewMessage] = useState('');

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newMessage.trim()) return;

    const assignedStaff = STAFF_COORDINATORS.find((s) => s.id === newAssignedCoordinator);
    const newInq: Inquiry = {
      id: `inq-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || null,
      type: newType,
      country: newCountry,
      preferred_region: newPreferredRegion,
      source: newSource,
      message: newMessage.trim(),
      status: 'new',
      assigned_to: newAssignedCoordinator,
      assigned_staff: assignedStaff ? { full_name: assignedStaff.name } : null,
      notes: 'Logged manually by coordinator.',
      created_at: new Date().toISOString(),
    };

    setInquiries((prev) => [newInq, ...prev]);
    logAction({
      action: 'CREATE_INQUIRY',
      tableName: 'inquiries',
      recordId: newInq.id,
      diff: { name: newInq.name, type: newInq.type },
    });
    toast('Inquiry Logged', `New inquiry for ${newInq.name} created.`, 'success');
    setIsCreateModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewMessage('');
  };

  // Filter inquiries by tab
  const filteredInquiries = inquiries.filter((inq) => {
    if (activeTab === 'all') return true;
    return inq.status === activeTab;
  });

  const handleStatusChange = (id: string, status: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
    setSelectedInquiry(null);
    logAction({
      action: 'UPDATE_INQUIRY_STATUS',
      tableName: 'inquiries',
      recordId: id,
      diff: { status },
    });
    toast('Inquiry Updated', `Status changed to ${status.replace('_', ' ')}.`, 'success');
  };

  const handleDelete = () => {
    if (!inquiryToDelete) return;
    setInquiries((prev) => prev.filter((i) => i.id !== inquiryToDelete.id));
    logAction({
      action: 'DELETE_INQUIRY',
      tableName: 'inquiries',
      recordId: inquiryToDelete.id,
    });
    toast('Deleted', 'Inquiry deleted successfully.', 'info');
    setInquiryToDelete(null);
  };

  const columns = React.useMemo<ColumnDef<Inquiry>[]>(
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
      header: 'Name',
      cell: ({ row }) => {
        const inq = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-[150px]">
            <Avatar src={inq.avatar_url} name={inq.name} size="sm" />
            <div className="truncate max-w-[170px]">
              <span className="font-semibold text-sm text-[#17191A] block truncate" title={inq.name}>
                {inq.name}
              </span>
              <span className="text-[11px] text-[#5D5E5F] block truncate" title={inq.message}>
                {inq.message}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const inq = row.original;
        return (
          <div className="space-y-0.5 whitespace-nowrap">
            <div className="flex items-center">
              <MaskedValue value={inq.email} type="email" tableName="inquiries" recordId={inq.id} />
            </div>
            <div className="flex items-center">
              <MaskedValue value={inq.phone} type="phone" tableName="inquiries" recordId={inq.id} />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Inquiry Type',
      cell: ({ row }) => (
        <span className="text-xs text-[#17191A] whitespace-nowrap block truncate max-w-[160px]" title={row.original.type}>
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: 'country',
      header: 'Country',
      cell: ({ row }) => <span className="text-xs text-[#5D5E5F] whitespace-nowrap">{row.original.country}</span>,
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => <span className="text-xs text-[#5D5E5F] whitespace-nowrap">{row.original.source || 'Website'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'created_at',
      header: 'Received',
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
        const inq = row.original;
        return (
          <div className="text-right">
            <RowActionsMenu
              rowLabel={`inquiry from ${inq.name}`}
              items={[
                {
                  id: 'view',
                  label: 'View details',
                  onClick: () => setSelectedInquiry(inq),
                },
                {
                  id: 'contacted',
                  label: 'Mark as Contacted',
                  onClick: () => handleStatusChange(inq.id, 'contacted'),
                },
                {
                  id: 'in-progress',
                  label: 'Mark In Progress',
                  onClick: () => handleStatusChange(inq.id, 'in_progress'),
                },
                {
                  id: 'spam',
                  label: 'Mark as Spam',
                  onClick: () => handleStatusChange(inq.id, 'spam'),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  destructive: true,
                  dividerAbove: true,
                  onClick: () => setInquiryToDelete(inq),
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
        title="Client Inquiries"
        description="Prospective intended parents and fertility inquiries submitted across public touchpoints."
        actions={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            iconLeading={<Plus className="w-4 h-4" />}
          >
            Log Inquiry
          </Button>
        }
      />

      {/* Status tabs */}
      <div className="border-b border-[#E1E0DD] flex gap-4 text-sm font-medium">
        {(['all', 'new', 'contacted', 'in_progress', 'closed', 'spam'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-[#17645F] text-[#17645F] font-semibold'
                : 'border-transparent text-[#5D5E5F] hover:text-[#17191A]'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <DataTable
        data={filteredInquiries}
        columns={columns}
        searchPlaceholder="Search inquiries by name, inquiry type, country..."
        onRowClick={(row) => setSelectedInquiry(row)}
        emptyState={{
          title: 'No inquiries found',
          description: `There are currently no inquiries in '${activeTab.replace('_', ' ')}'.`,
        }}
        bulkActions={(selected, clear) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setInquiries((prev) =>
                  prev.map((i) => (selected.some((s) => s.id === i.id) ? { ...i, status: 'closed' } : i))
                );
                toast('Bulk Updated', `Marked ${selected.length} inquiries as closed.`, 'success');
                clear();
              }}
            >
              Mark Closed
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setInquiries((prev) =>
                  prev.map((i) => (selected.some((s) => s.id === i.id) ? { ...i, status: 'spam' } : i))
                );
                toast('Marked Spam', `Marked ${selected.length} inquiries as spam.`, 'info');
                clear();
              }}
            >
              Mark Spam
            </Button>
          </div>
        )}
      />

      {/* Inquiry Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        title="Inquiry Details"
        description={`Inbound message from ${selectedInquiry?.name}`}
      >
        {selectedInquiry && (
          <div className="space-y-6">
            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Status</span>
                <StatusBadge status={selectedInquiry.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Inquiry Type</span>
                <span className="text-xs font-semibold text-[#17191A]">{selectedInquiry.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Country</span>
                <span className="text-xs text-[#17191A]">{selectedInquiry.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Preferred Region</span>
                <span className="text-xs font-medium text-[#17645F]">{selectedInquiry.preferred_region || 'National / General'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Inbound Channel / Source</span>
                <Badge variant="gray" size="sm">{selectedInquiry.source || 'Website form'}</Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E1E0DD]">
                <span className="text-xs text-[#5D5E5F]">Assigned Coordinator</span>
                <select
                  value={selectedInquiry.assigned_to || '1'}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const nextStaff = STAFF_COORDINATORS.find((s) => s.id === nextId);
                    setInquiries((prev) =>
                      prev.map((i) =>
                        i.id === selectedInquiry.id
                          ? { ...i, assigned_to: nextId, assigned_staff: nextStaff ? { full_name: nextStaff.name } : null }
                          : i
                      )
                    );
                    setSelectedInquiry((prev) =>
                      prev
                        ? {
                            ...prev,
                            assigned_to: nextId,
                            assigned_staff: nextStaff ? { full_name: nextStaff.name } : null,
                          }
                        : null
                    );
                    toast('Coordinator Assigned', `Inquiry assigned to ${nextStaff?.name}.`, 'success');
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

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Masked Contact Details
              </h4>
              <div className="space-y-1.5 p-3 rounded-[8px] border border-[#E1E0DD]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D5E5F]">Email</span>
                  <MaskedValue value={selectedInquiry.email} type="email" tableName="inquiries" recordId={selectedInquiry.id} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D5E5F]">Phone</span>
                  <MaskedValue value={selectedInquiry.phone} type="phone" tableName="inquiries" recordId={selectedInquiry.id} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Inbound Message Content
              </h4>
              <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] text-xs leading-relaxed text-[#2E3031]">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Internal Coordinator Notes
              </h4>
              <p className="text-xs text-[#5D5E5F]">
                Never collect or store medical details in free-text notes.
              </p>
              <Textarea
                rows={3}
                value={selectedInquiry.notes || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedInquiry((prev) => prev ? { ...prev, notes: val } : null);
                  setInquiries((prev) =>
                    prev.map((i) => (i.id === selectedInquiry.id ? { ...i, notes: val } : i))
                  );
                }}
                placeholder="Log follow-up communication or outreach timeline..."
              />
            </div>

            <div className="pt-4 border-t border-[#E1E0DD] flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange(selectedInquiry.id, 'contacted')}
              >
                Mark Contacted
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange(selectedInquiry.id, 'in_progress')}
              >
                Mark In Progress
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange(selectedInquiry.id, 'closed')}
              >
                Close Inquiry
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Log Manual Inquiry Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="2xl"
        title="Log Inbound Client Inquiry"
        description="Record an inquiry received over phone, WhatsApp, partner clinic referral, or offline consultation."
      >
        <form onSubmit={handleCreateInquiry} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Full Name"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Tunde &amp; Folake B."
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone / WhatsApp Number"
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+234..."
            />
            <Select
              label="Inquiry Topic / Service"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              options={[
                { value: 'Cost estimate', label: 'Cost estimate & Package pricing' },
                { value: 'Gestational Surrogacy Inquiry', label: 'Gestational Surrogacy Inquiry' },
                { value: 'Egg Donor Matching', label: 'Egg Donor Matching & Selection' },
                { value: 'IVF Consultation and Coordination', label: 'IVF Consultation & Coordination' },
                { value: 'International Intended Parent', label: 'International / Cross-Border Support' },
                { value: 'General question', label: 'General question' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Country of Residence"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              options={[
                { value: 'Nigeria', label: 'Nigeria' },
                { value: 'United Kingdom', label: 'United Kingdom' },
                { value: 'United States', label: 'United States' },
                { value: 'Canada', label: 'Canada' },
                { value: 'Ghana', label: 'Ghana' },
                { value: 'Germany', label: 'Germany' },
                { value: 'Ireland', label: 'Ireland' },
                { value: 'Australia', label: 'Australia' },
                { value: 'Other', label: 'Other Country' },
              ]}
            />
            <Select
              label="Preferred Treatment Region"
              value={newPreferredRegion}
              onChange={(e) => setNewPreferredRegion(e.target.value)}
              options={[
                { value: 'Lagos', label: 'Lagos, Nigeria' },
                { value: 'Abuja', label: 'Abuja, Nigeria' },
                { value: 'Port Harcourt', label: 'Port Harcourt, Nigeria' },
                { value: 'International / Cross-Border', label: 'International / Cross-Border' },
              ]}
            />
            <Select
              label="Inbound Channel / Source"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              options={[
                { value: 'Website form', label: 'Website form' },
                { value: 'WhatsApp direct', label: 'WhatsApp direct' },
                { value: 'Phone consultation', label: 'Phone call' },
                { value: 'Fertility Clinic Referral', label: 'Fertility Clinic Referral' },
                { value: 'Previous Client Referral', label: 'Client Referral' },
                { value: 'Instagram / Social', label: 'Instagram / Social' },
              ]}
            />
          </div>

          <Select
            label="Assigned Coordinator"
            value={newAssignedCoordinator}
            onChange={(e) => setNewAssignedCoordinator(e.target.value)}
            options={STAFF_COORDINATORS.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
          />

          <Textarea
            label="Client Inbound Message / Inquiry Details"
            required
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Record client goals, timeline, and questions asked..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E0DD]">
            <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Log Inquiry
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(inquiryToDelete)}
        onClose={() => setInquiryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Inquiry Record"
        description={`Are you sure you want to delete the inquiry from ${inquiryToDelete?.name}?`}
        confirmLabel="Delete Inquiry"
      />
    </div>
  );
};
