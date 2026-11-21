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
import { Select } from '../components/untitledui/Select';
import { Textarea } from '../components/untitledui/Textarea';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAuditLog } from '../hooks/useAuditLog';
import type { Inquiry, InquiryStatus } from '../types';

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
