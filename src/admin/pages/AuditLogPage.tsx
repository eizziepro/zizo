import React, { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Badge } from '../components/untitledui/Badge';
import { Modal } from '../components/untitledui/Modal';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { usePermissions } from '../hooks/usePermissions';
import { ForbiddenPage } from './ForbiddenPage';
import type { AuditLogEntry } from '../types';

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    actor: 'Chizaram Ata',
    action: 'REVEAL_PII',
    table_name: 'inquiries',
    record_id: 'inq-1',
    diff: { field: 'email', accessed_at: '2026-11-18T01:35:00Z' },
    ip_address: '102.89.23.14',
    created_at: '2026-11-18T01:35:00Z',
  },
  {
    id: 'aud-2',
    actor: 'Amara Okafor',
    action: 'UPDATE_INQUIRY_STATUS',
    table_name: 'inquiries',
    record_id: 'inq-2',
    diff: { before: { status: 'new' }, after: { status: 'in_progress' } },
    ip_address: '197.210.45.67',
    created_at: '2026-11-17T14:10:00Z',
  },
  {
    id: 'aud-3',
    actor: 'Chizaram Ata',
    action: 'EXPORT_SUBSCRIBERS_CSV',
    table_name: 'subscribers',
    diff: { total_records_exported: 4 },
    ip_address: '102.89.23.14',
    created_at: '2026-11-16T10:00:00Z',
  },
  {
    id: 'aud-4',
    actor: 'Tunde Bakare',
    action: 'EDIT_POST',
    table_name: 'posts',
    record_id: 'post-1',
    diff: { slug: 'navigating-cross-border-surrogacy-contracts' },
    ip_address: '105.112.89.12',
    created_at: '2026-11-15T16:20:00Z',
  },
];

export const AuditLogPage: React.FC = () => {
  const { isOwner } = usePermissions();
  const [logs] = useState<AuditLogEntry[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('zizo_audit_log') || '[]');
      return stored.length > 0 ? stored : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  if (!isOwner) {
    return <ForbiddenPage />;
  }

  const columns = React.useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: 'created_at',
      header: 'Timestamp',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#5D5E5F] whitespace-nowrap">
          {new Date(row.original.created_at).toLocaleString('en-GB')}
        </span>
      ),
    },
    {
      accessorKey: 'actor',
      header: 'Staff Actor',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-[#17191A] whitespace-nowrap">{row.original.actor}</span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const act = row.original.action;
        const variant = act.includes('DELETE')
          ? 'error'
          : act.includes('REVEAL')
          ? 'warning'
          : act.includes('EXPORT')
          ? 'blue'
          : 'brand';

        return <Badge variant={variant} size="sm">{act}</Badge>;
      },
    },
    {
      accessorKey: 'table_name',
      header: 'Object / Entity',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#17191A] whitespace-nowrap">{row.original.table_name}</span>
      ),
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-[#5D5E5F] whitespace-nowrap">
          {row.original.ip_address || '102.89.23.14'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <RowActionsMenu
            rowLabel={`audit entry ${row.original.id}`}
            items={[
              {
                id: 'view-diff',
                label: 'View details & diff',
                onClick: () => setSelectedLog(row.original),
              },
            ]}
          />
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Audit Log &amp; Activity Trail"
        description="Immutable compliance audit trail tracking all clinical staff modifications, exports, and PII reveals."
      />

      <DataTable
        data={logs}
        columns={columns}
        searchPlaceholder="Search audit log by actor, action, table..."
        onRowClick={(row) => setSelectedLog(row)}
      />

      {/* Diff Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Trail Inspector"
        description={`Record ${selectedLog?.id} — ${selectedLog?.action}`}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#FAF9F6] border border-[#E1E0DD] rounded-[8px] space-y-1">
              <p>
                <strong>Actor:</strong> {selectedLog.actor}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date(selectedLog.created_at).toISOString()}
              </p>
              <p>
                <strong>Table:</strong> {selectedLog.table_name}
              </p>
              {selectedLog.record_id && (
                <p>
                  <strong>Record ID:</strong> {selectedLog.record_id}
                </p>
              )}
            </div>

            <div>
              <p className="font-semibold text-[#17191A] mb-1">Payload / Diff:</p>
              <pre className="p-3 bg-[#17191A] text-[#FAF9F6] rounded-[8px] overflow-x-auto font-mono text-[11px]">
                {JSON.stringify(selectedLog.diff || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
