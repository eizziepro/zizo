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
import { Modal } from '../components/untitledui/Modal';
import { Drawer } from '../components/untitledui/Drawer';
import { Input } from '../components/untitledui/Input';
import { Textarea } from '../components/untitledui/Textarea';
import { Select } from '../components/untitledui/Select';
import { useNotifications } from '../context/NotificationContext';
import { usePermissions } from '../hooks/usePermissions';
import { Plus, Calendar, List, Link01 } from '@untitledui/icons';
import type { Booking, BookingStatus } from '../types';

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-1',
    consultation_type_id: 'ct-1',
    consultation_type: { name: 'Intended Parent Consultation', duration_min: 30, price_minor: 0, currency: 'NGN' },
    staff_id: '1',
    assigned_staff: { full_name: 'Dr. Chizaram Ata' },
    start_at: '2026-11-20T10:00:00Z',
    end_at: '2026-11-20T10:30:00Z',
    status: 'confirmed',
    name: 'Parent AJ',
    email: 'parent.aj@example.com',
    phone: '+2348012345678',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80',
    country: 'United Kingdom',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    note: 'Inquiring regarding gestational surrogacy in Nigeria and international transit legalities.',
    payment_status: 'not_required',
    created_at: '2026-11-17T14:30:00Z',
  },
  {
    id: 'bk-2',
    consultation_type_id: 'ct-2',
    consultation_type: { name: 'Surrogate Information Call', duration_min: 20, price_minor: 0, currency: 'NGN' },
    staff_id: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    start_at: '2026-11-21T14:00:00Z',
    end_at: '2026-11-21T14:20:00Z',
    status: 'pending',
    name: 'Blessing O.',
    email: 'blessing.o@example.com',
    phone: '+2348098765432',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    audience: 'Surrogate',
    channel: 'WhatsApp call',
    note: 'Questions on health screening and compensation timeline.',
    payment_status: 'not_required',
    created_at: '2026-11-17T18:00:00Z',
  },
  {
    id: 'bk-3',
    consultation_type_id: 'ct-4',
    consultation_type: { name: 'Cost and Program Planning', duration_min: 45, price_minor: 0, currency: 'NGN' },
    staff_id: '1',
    assigned_staff: { full_name: 'Dr. Chizaram Ata' },
    start_at: '2026-11-15T11:00:00Z',
    end_at: '2026-11-15T11:45:00Z',
    status: 'completed',
    name: 'Parent SS & MV',
    email: 'parents.ss.mv@example.com',
    phone: '+14155552671',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
    country: 'United States',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    note: 'Detailed budgeting for dual embryo transfers.',
    payment_status: 'not_required',
    created_at: '2026-11-10T09:15:00Z',
  },
  {
    id: 'bk-4',
    consultation_type_id: 'ct-3',
    consultation_type: { name: 'Egg Donor Information Call', duration_min: 20, price_minor: 0, currency: 'NGN' },
    staff_id: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    start_at: '2026-11-12T15:00:00Z',
    end_at: '2026-11-12T15:20:00Z',
    status: 'cancelled',
    name: 'Chioma E.',
    email: 'chioma.e@example.com',
    phone: '+2347031112233',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    audience: 'Egg Donor',
    channel: 'Phone call',
    note: 'Rescheduling requested due to exam timetable.',
    payment_status: 'not_required',
    created_at: '2026-11-08T12:00:00Z',
  },
];

export const BookingsPage: React.FC = () => {
  const { toast } = useNotifications();
  const { isOwner } = usePermissions();

  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled' | 'all'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Drawer & modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Create booking drawer
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newChannel, setNewChannel] = useState('Google Meet');

  // Filter bookings by active tab
  const now = new Date().toISOString();
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') return b.status !== 'cancelled' && b.start_at >= now;
    if (activeTab === 'past') return b.status === 'completed' || (b.start_at < now && b.status !== 'cancelled');
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    toast('Status Updated', `Booking status changed to ${newStatus}.`, 'success');
  };

  const handleReschedule = () => {
    if (!selectedBooking || !newDate || !newTime) return;
    const startIso = `${newDate}T${newTime}:00Z`;

    // Overlap exclusion check simulation
    const conflict = bookings.find(
      (b) => b.id !== selectedBooking.id && b.start_at === startIso && b.status !== 'cancelled'
    );
    if (conflict) {
      toast('Booking Conflict (409)', 'The selected appointment slot is already reserved. Please select another time.', 'error');
      return;
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === selectedBooking.id ? { ...b, start_at: startIso } : b))
    );

    toast(
      'Rescheduled',
      `Booking rescheduled to ${newDate} at ${newTime} (WAT).${notifyClient ? ' Client notified by email.' : ''}`,
      'success'
    );
    setRescheduleModalOpen(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    handleStatusChange(selectedBooking.id, 'cancelled');
    toast(
      'Booking Cancelled',
      `Appointment cancelled.${notifyClient ? ' Client received cancellation notice.' : ''}`,
      'info'
    );
    setCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const columns: ColumnDef<Booking>[] = [
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
      header: 'Client',
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-[170px]">
            <Avatar src={b.avatar_url} name={b.name} size="sm" />
            <div className="truncate max-w-[170px]">
              <p className="font-semibold text-sm text-[#17191A] truncate">{b.name}</p>
              <div className="space-y-0.5 whitespace-nowrap">
                <MaskedValue value={b.email} type="email" tableName="bookings" recordId={b.id} />
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'consultation_type',
      header: 'Consultation Type',
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <span className="font-medium text-xs text-[#17191A] block">
            {row.original.consultation_type?.name || 'General Consultation'}
          </span>
          <span className="text-[11px] text-[#17645F] font-semibold">
            {row.original.consultation_type?.duration_min || 30} mins
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'start_at',
      header: 'Date & Time',
      cell: ({ row }) => {
        const d = new Date(row.original.start_at);
        return (
          <div className="whitespace-nowrap" title="Time calculated in Africa/Lagos (WAT, UTC+1)">
            <p className="font-medium text-xs text-[#17191A]">
              {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-[11px] font-mono text-[#5D5E5F]">
              {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} WAT
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'channel',
      header: 'Channel',
      cell: ({ row }) => <Badge variant="gray" size="sm">{row.original.channel}</Badge>,
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
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="text-right">
            <RowActionsMenu
              rowLabel={`booking for ${b.name}`}
              items={[
                {
                  id: 'view',
                  label: 'View details',
                  onClick: () => setSelectedBooking(b),
                },
                {
                  id: 'reschedule',
                  label: 'Reschedule',
                  onClick: () => {
                    setSelectedBooking(b);
                    setRescheduleModalOpen(true);
                  },
                },
                {
                  id: 'cancel',
                  label: 'Cancel booking',
                  onClick: () => {
                    setSelectedBooking(b);
                    setCancelModalOpen(true);
                  },
                },
                {
                  id: 'complete',
                  label: 'Mark completed',
                  onClick: () => handleStatusChange(b.id, 'completed'),
                },
                {
                  id: 'no-show',
                  label: 'Mark no-show',
                  onClick: () => handleStatusChange(b.id, 'no_show'),
                },
                {
                  id: 'copy-link',
                  label: 'Copy manage link',
                  onClick: () => {
                    navigator.clipboard.writeText(`https://zizo.com/book/manage/?token=sample-${b.id}`);
                    toast('Link Copied', 'Private booking manage URL copied to clipboard.', 'info');
                  },
                },
                ...(isOwner
                  ? [
                      {
                        id: 'delete',
                        label: 'Delete booking',
                        destructive: true,
                        dividerAbove: true,
                        onClick: () => {
                          setBookings((prev) => prev.filter((item) => item.id !== b.id));
                          toast('Deleted', 'Booking record removed.', 'info');
                        },
                      },
                    ]
                  : []),
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
        title="Consultation Bookings"
        description="Review scheduled parent, surrogate, and donor conversations across global timezones."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-[8px] border border-[#E1E0DD] bg-white p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[6px] text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#17645F] text-white'
                    : 'text-[#5D5E5F] hover:text-[#17191A]'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-[6px] text-xs font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[#17645F] text-white'
                    : 'text-[#5D5E5F] hover:text-[#17191A]'
                }`}
                aria-label="Calendar view"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={() => setCreateDrawerOpen(true)}
              iconLeading={<Plus className="w-4 h-4" />}
            >
              New Booking
            </Button>
          </div>
        }
      />

      {/* Tabs bar */}
      <div className="border-b border-[#E1E0DD] flex gap-4 text-sm font-medium">
        {(['upcoming', 'past', 'cancelled', 'all'] as const).map((tab) => (
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
            {tab}
          </button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <DataTable
          data={filteredBookings}
          columns={columns}
          searchPlaceholder="Search bookings by client, email, channel..."
          onRowClick={(row) => setSelectedBooking(row)}
          emptyState={{
            title: 'No bookings found',
            description: `There are currently no ${activeTab} consultations.`,
            actionLabel: 'Schedule a booking',
            onAction: () => setCreateDrawerOpen(true),
          }}
        />
      ) : (
        /* Calendar view presentation */
        <div className="rounded-[10px] border border-[#E1E0DD] bg-white p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E1E0DD]">
            <h3 className="font-semibold text-base text-[#17191A]">Appointments Agenda</h3>
            <span className="text-xs text-[#5D5E5F] font-mono">Timezone: Africa/Lagos (WAT)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="p-4 rounded-[8px] border border-[#E1E0DD] bg-[#FAF9F6] hover:border-[#17645F] transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#17645F] font-semibold">
                    {new Date(b.start_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} WAT
                  </span>
                  <StatusBadge status={b.status} />
                </div>
                <h4 className="font-semibold text-sm text-[#17191A]">{b.name}</h4>
                <p className="text-xs text-[#5D5E5F] line-clamp-1">{b.consultation_type?.name}</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E1E0DD] text-[11px] text-[#5D5E5F]">
                  <span>{b.channel}</span>
                  <span>{b.country}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Details Drawer */}
      <Drawer
        isOpen={Boolean(selectedBooking && !rescheduleModalOpen && !cancelModalOpen)}
        onClose={() => setSelectedBooking(null)}
        title="Consultation Details"
        description={`Appointment record for ${selectedBooking?.name}`}
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Status</span>
                <StatusBadge status={selectedBooking.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Consultation</span>
                <span className="text-xs font-semibold text-[#17191A]">
                  {selectedBooking.consultation_type?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Date &amp; Time</span>
                <span className="text-xs font-mono font-medium text-[#17645F]">
                  {new Date(selectedBooking.start_at).toLocaleString('en-GB')} WAT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Channel</span>
                <Badge variant="gray" size="sm">{selectedBooking.channel}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Client Contact
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D5E5F]">Email</span>
                  <MaskedValue value={selectedBooking.email} type="email" tableName="bookings" recordId={selectedBooking.id} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D5E5F]">Phone</span>
                  <MaskedValue value={selectedBooking.phone} type="phone" tableName="bookings" recordId={selectedBooking.id} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D5E5F]">Location</span>
                  <span className="text-[#17191A] font-medium">{selectedBooking.country}</span>
                </div>
              </div>
            </div>

            {selectedBooking.note && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                  Client Notes
                </h4>
                <p className="p-3 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] text-xs text-[#2E3031] leading-relaxed">
                  {selectedBooking.note}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[#E1E0DD] flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRescheduleModalOpen(true)}
              >
                Reschedule Appointment
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Appointment
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Consultation"
        description="Select a new available date and time slot in Africa/Lagos (WAT)."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRescheduleModalOpen(false)}>
              Back
            </Button>
            <Button onClick={handleReschedule}>Confirm Reschedule</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="New Date"
            type="date"
            required
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <Input
            label="New Time (Africa/Lagos WAT)"
            type="time"
            required
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
          <Textarea
            label="Reason for Rescheduling"
            rows={2}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="Clinical availability conflict..."
          />
          <label className="flex items-center gap-2 text-xs text-[#17191A] cursor-pointer">
            <input
              type="checkbox"
              checked={notifyClient}
              onChange={(e) => setNotifyClient(e.target.checked)}
              className="w-4 h-4 accent-[#17645F]"
            />
            <span>Dispatch automated update email to client</span>
          </label>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Consultation Appointment"
        description="Are you sure you want to cancel this booking?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Textarea
            label="Cancellation Reason"
            rows={2}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="Client request / medical conflict..."
          />
          <label className="flex items-center gap-2 text-xs text-[#17191A] cursor-pointer">
            <input
              type="checkbox"
              checked={notifyClient}
              onChange={(e) => setNotifyClient(e.target.checked)}
              className="w-4 h-4 accent-[#17645F]"
            />
            <span>Dispatch cancellation email to client</span>
          </label>
        </div>
      </Modal>

      {/* Create Booking Drawer */}
      <Drawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        title="Schedule Manual Consultation"
        description="Create an appointment directly for an intended parent or surrogate."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newBk: Booking = {
              id: 'bk-' + Date.now(),
              consultation_type_id: 'ct-1',
              consultation_type: { name: 'Intended Parent Consultation', duration_min: 30, price_minor: 0, currency: 'NGN' },
              staff_id: '1',
              start_at: new Date(Date.now() + 86400000 * 2).toISOString(),
              end_at: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString(),
              status: 'confirmed',
              name: newName,
              email: newEmail,
              phone: newPhone,
              country: 'Nigeria',
              audience: 'Intended Parent',
              channel: newChannel,
              payment_status: 'not_required',
              created_at: new Date().toISOString(),
            };
            setBookings((prev) => [newBk, ...prev]);
            toast('Booking Created', `Scheduled consultation for ${newName}.`, 'success');
            setCreateDrawerOpen(false);
          }}
          className="space-y-4"
        >
          <Input label="Client Name" required value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input label="Client Email" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Input label="Phone Number" type="tel" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <Select
            label="Consultation Channel"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            options={[
              { value: 'Google Meet', label: 'Google Meet' },
              { value: 'WhatsApp call', label: 'WhatsApp call' },
              { value: 'Phone call', label: 'Phone call' },
            ]}
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setCreateDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm &amp; Schedule</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
