import React, { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { MaskedValue } from '../components/common/MaskedValue';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Button } from '../components/untitledui/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { usePermissions } from '../hooks/usePermissions';
import { useAuditLog } from '../hooks/useAuditLog';
import { Download01 } from '@untitledui/icons';
import type { Subscriber } from '../types';

const INITIAL_SUBSCRIBERS: Subscriber[] = [
  {
    id: 'sub-1',
    email: 'kemi.adebayo@example.com',
    name: 'Kemi Adebayo',
    status: 'confirmed',
    source: 'Footer newsletter',
    created_at: '2026-11-15T14:00:00Z',
  },
  {
    id: 'sub-2',
    email: 'john.smith.uk@example.com',
    name: 'John Smith',
    status: 'confirmed',
    source: 'Blog sidebar',
    created_at: '2026-11-12T09:30:00Z',
  },
  {
    id: 'sub-3',
    email: 'fatima.d@example.com',
    name: null,
    status: 'pending',
    source: 'Footer newsletter',
    created_at: '2026-11-18T00:45:00Z',
  },
  {
    id: 'sub-4',
    email: 'chinedu.o@example.com',
    name: 'Chinedu Okafor',
    status: 'unsubscribed',
    source: 'Intended Parents guide',
    created_at: '2026-10-25T11:15:00Z',
  },
];

export const SubscribersPage: React.FC = () => {
  const { toast } = useNotifications();
  const { isOwner, isCoordinator } = usePermissions();
  const { logAction } = useAuditLog();

  const [subscribers, setSubscribers] = useState<Subscriber[]>(INITIAL_SUBSCRIBERS);
  const [subToDelete, setSubToDelete] = useState<Subscriber | null>(null);

  const handleExportCsv = async () => {
    if (!isOwner && !isCoordinator) {
      toast('Unauthorized', 'Exporting subscriber records requires Owner or Coordinator role.', 'error');
      return;
    }

    await logAction({
      action: 'EXPORT_SUBSCRIBERS_CSV',
      tableName: 'subscribers',
      diff: { count: subscribers.length },
    });

    const headers = 'ID,Email,Name,Status,Source,SubscribedAt\n';
    const rows = subscribers
      .map((s) => `${s.id},"${s.email}","${s.name || ''}",${s.status},"${s.source || ''}",${s.created_at}`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zizo-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('Export Generated', 'Subscribers CSV downloaded and recorded in audit log.', 'success');
  };

  const handleUnsubscribe = (id: string) => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'unsubscribed' } : s))
    );
    toast('Unsubscribed', 'Subscriber marked as unsubscribed.', 'info');
  };

  const handleDelete = () => {
    if (!subToDelete) return;
    setSubscribers((prev) => prev.filter((s) => s.id !== subToDelete.id));
    logAction({
      action: 'DELETE_SUBSCRIBER',
      tableName: 'subscribers',
      recordId: subToDelete.id,
    });
    toast('Deleted', 'Subscriber removed.', 'info');
    setSubToDelete(null);
  };

  const columns: ColumnDef<Subscriber>[] = [
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
      accessorKey: 'email',
      header: 'Subscriber Email',
      cell: ({ row }) => (
        <MaskedValue value={row.original.email} type="email" tableName="subscribers" recordId={row.original.id} />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="text-xs text-[#17191A]">{row.original.name || <em className="text-[#969594]">None</em>}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => <span className="text-xs text-[#5D5E5F]">{row.original.source || 'Website'}</span>,
    },
    {
      accessorKey: 'created_at',
      header: 'Subscribed Date',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-[#5D5E5F]">
          {new Date(row.original.created_at).toLocaleDateString('en-GB')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-right">
            <RowActionsMenu
              rowLabel={`subscriber ${s.email}`}
              items={[
                {
                  id: 'resend',
                  label: 'Resend confirmation email',
                  disabled: s.status === 'confirmed',
                  onClick: () => toast('Sent', 'Confirmation email redispatched.', 'info'),
                },
                {
                  id: 'unsubscribe',
                  label: 'Unsubscribe',
                  disabled: s.status === 'unsubscribed',
                  onClick: () => handleUnsubscribe(s.id),
                },
                {
                  id: 'delete',
                  label: 'Delete subscriber',
                  destructive: true,
                  dividerAbove: true,
                  onClick: () => setSubToDelete(s),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Newsletter Subscribers"
        description="Audience members subscribed to clinical newsletters and fertility updates."
        breadcrumbs={[{ label: 'Staff Portal', href: '/' }, { label: 'Subscribers' }]}
        actions={
          (isOwner || isCoordinator) && (
            <Button
              onClick={handleExportCsv}
              variant="secondary"
              iconLeading={<Download01 className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          )
        }
      />

      <DataTable
        data={subscribers}
        columns={columns}
        searchPlaceholder="Search subscribers..."
      />

      <ConfirmModal
        isOpen={Boolean(subToDelete)}
        onClose={() => setSubToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Subscriber"
        description="Are you sure you want to delete this subscriber record?"
        confirmLabel="Delete Subscriber"
      />
    </div>
  );
};
