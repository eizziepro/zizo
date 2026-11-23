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
import { Plus, Calendar, List, Link01, Check, Edit01, RefreshCw01 } from '@untitledui/icons';
import type { Booking, BookingStatus } from '../types';

const STORAGE_KEY = 'zizo_admin_bookings_v2';

const CONSULTATION_TYPES = [
  { id: 'ct-1', name: 'Intended Parent Consultation', duration_min: 30 },
  { id: 'ct-2', name: 'Surrogate Information Call', duration_min: 20 },
  { id: 'ct-3', name: 'Egg Donor Information Call', duration_min: 20 },
  { id: 'ct-4', name: 'Cost and Program Planning', duration_min: 45 },
];

const STAFF_MEMBERS = [
  { id: '1', full_name: 'Chizaram Ata' },
  { id: '2', full_name: 'Amara Okafor' },
  { id: '3', full_name: 'Babatunde Adeyemi' },
];

function computeSlot(daysOffset: number, hours: number, minutes: number, durationMin: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  const end = new Date(d.getTime() + durationMin * 60000);
  return {
    start_at: d.toISOString(),
    end_at: end.toISOString(),
  };
}

export const generateDummyBookings = (): Booking[] => [
  // --- 7 Upcoming Consultations ---
  {
    id: 'bk-1',
    consultation_type_id: 'ct-1',
    consultation_type: { name: 'Intended Parent Consultation', duration_min: 30, price_minor: 0, currency: 'NGN' },
    staff_id: '1',
    assigned_staff: { full_name: 'Chizaram Ata' },
    ...computeSlot(1, 10, 0, 30),
    status: 'confirmed',
    name: 'Ade & Folake M.',
    email: 'adefolake.m@example.co.uk',
    phone: '+44 7911 123456',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    country: 'United Kingdom',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-ip-adefolake',
    note: 'UK diaspora couple seeking gestational surrogacy pathway in Lagos. Questions regarding newborn exit documentation and British high commission DNA protocol.',
    internal_notes: 'Reviewed initial questionnaire. Both embryos created and vitrified at Bridge Clinic. Ready for match introduction.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'bk-2',
    consultation_type_id: 'ct-4',
    consultation_type: { name: 'Cost and Program Planning', duration_min: 45, price_minor: 0, currency: 'NGN' },
    staff_id: '1',
    assigned_staff: { full_name: 'Chizaram Ata' },
    ...computeSlot(1, 14, 0, 45),
    status: 'confirmed',
    name: 'Dr. & Mrs. Okon',
    email: 'okon.family@example.com',
    phone: '+1 281 555 0192',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    country: 'United States',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-cost-okon',
    note: 'Houston-based physician couple interested in comprehensive cost breakdown, legal escrow safeguards, and international travel logistics.',
    internal_notes: 'Sent 2026-2027 fee schedule v3. Focus conversation on escrow milestones and medical insurance contingency pool.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'bk-3',
    consultation_type_id: 'ct-2',
    consultation_type: { name: 'Surrogate Information Call', duration_min: 20, price_minor: 0, currency: 'NGN' },
    staff_id: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    ...computeSlot(2, 11, 0, 20),
    status: 'pending',
    name: 'Blessing O.',
    email: 'blessing.o@example.com',
    phone: '+234 809 876 5432',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    audience: 'Surrogate',
    channel: 'WhatsApp call',
    meeting_url: 'https://wa.me/2348098765432',
    note: 'Candidate completed online intake. Mother of two uncomplicated deliveries. Inquiring about housing support and allowance schedules.',
    internal_notes: 'Verify spouse consent letter and check obstetric discharge summary from previous delivery.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'bk-4',
    consultation_type_id: 'ct-3',
    consultation_type: { name: 'Egg Donor Information Call', duration_min: 20, price_minor: 0, currency: 'NGN' },
    staff_id: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    ...computeSlot(3, 15, 0, 20),
    status: 'confirmed',
    name: 'Kemi B.',
    email: 'kemi.b@example.com',
    phone: '+234 803 442 9811',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    audience: 'Egg Donor',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-donor-kemi',
    note: 'Graduate student in biochemistry. Inquiring about stimulation cycle protocol, medication self-administration, and confidentiality guarantees.',
    internal_notes: 'AMH test result uploaded (3.4 ng/mL). Excellent candidate profile.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'bk-5',
    consultation_type_id: 'ct-1',
    consultation_type: { name: 'Intended Parent Consultation', duration_min: 30, price_minor: 0, currency: 'NGN' },
    staff_id: '1',
    assigned_staff: { full_name: 'Chizaram Ata' },
    ...computeSlot(4, 16, 0, 30),
    status: 'confirmed',
    name: 'Sarah & Liam Jenkins',
    email: 'jenkins.family@example.ca',
    phone: '+1 416 555 8390',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
    country: 'Canada',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-ip-jenkins',
    note: 'Canadian couple reviewing African surrogacy options. Comparing legal parentage timelines and clinic success rates.',
    internal_notes: 'Explain Ontario birth certificate acquisition process and coordinate with High Commission legal counsel.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'bk-6',
    consultation_type_id: 'ct-4',
    consultation_type: { name: 'Cost and Program Planning', duration_min: 45, price_minor: 0, currency: 'NGN' },
    staff_id: '3',
    assigned_staff: { full_name: 'Babatunde Adeyemi' },
    ...computeSlot(5, 9, 30, 45),
    status: 'confirmed',
    name: 'David & Michael K.',
    email: 'david.m.k@example.com.au',
    phone: '+61 2 9876 5432',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    country: 'Australia',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-cost-aus',
    note: 'Sydney-based couple. Discussing dedicated donor selection with independent gestational surrogate matching.',
    internal_notes: 'Ensure legal framework deck includes Australia Part VII family law considerations.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'bk-7',
    consultation_type_id: 'ct-2',
    consultation_type: { name: 'Surrogate Information Call', duration_min: 20, price_minor: 0, currency: 'NGN' },
    staff_id: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    ...computeSlot(6, 12, 0, 20),
    status: 'pending',
    name: 'Grace A.',
    email: 'grace.a@example.com',
    phone: '+234 812 345 6789',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    audience: 'Surrogate',
    channel: 'Phone call',
    meeting_url: null,
    note: 'Registered nurse from Abuja inquiring about clinical screening requirements and travel accommodation in Lagos during cycle.',
    internal_notes: 'Nurse practitioner background; verify availability for in-person baseline scan in Lagos.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },

  // --- 4 Past Consultations ---
  {
    id: 'bk-8',
    consultation_type_id: 'ct-4',
    consultation_type: { name: 'Cost and Program Planning', duration_min: 45, price_minor: 0, currency: 'NGN' },
    staff_id: '1',
    assigned_staff: { full_name: 'Chizaram Ata' },
    ...computeSlot(-8, 11, 0, 45),
    status: 'completed',
    name: 'Parent SS & MV',
    email: 'parents.ss.mv@example.com',
    phone: '+1 415 555 2671',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80',
    country: 'United States',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-ss-mv',
    note: 'Detailed budgeting for dual embryo transfers and twin insurance rider.',
    internal_notes: 'Consultation completed successfully. Retainer agreement sent and executed. Transitioned to active case CS-2026-001.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'bk-9',
    consultation_type_id: 'ct-1',
    consultation_type: { name: 'Intended Parent Consultation', duration_min: 30, price_minor: 0, currency: 'NGN' },
    staff_id: '1',
    assigned_staff: { full_name: 'Chizaram Ata' },
    ...computeSlot(-5, 14, 0, 30),
    status: 'completed',
    name: 'Tunde & Bisola E.',
    email: 'tunde.bisola@example.com',
    phone: '+234 802 334 5566',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-tunde-bisola',
    note: 'Domestic intended parents looking for accelerated surrogate matching in Lagos.',
    internal_notes: 'Referred to Bridge Clinic for endometrial ultrasound. Matched with surrogate candidate SC-8821.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'bk-10',
    consultation_type_id: 'ct-2',
    consultation_type: { name: 'Surrogate Information Call', duration_min: 20, price_minor: 0, currency: 'NGN' },
    staff_id: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    ...computeSlot(-3, 10, 0, 20),
    status: 'completed',
    name: 'Mary N.',
    email: 'mary.n@example.com',
    phone: '+234 816 778 8990',
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    audience: 'Surrogate',
    channel: 'WhatsApp call',
    meeting_url: 'https://wa.me/2348167788990',
    note: 'Initial surrogate intake call. Discussed medical checkups and family support.',
    internal_notes: 'Completed telephone interview. Candidate scored 95% on readiness checklist. Scheduled for clinic baseline.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'bk-11',
    consultation_type_id: 'ct-1',
    consultation_type: { name: 'Intended Parent Consultation', duration_min: 30, price_minor: 0, currency: 'NGN' },
    staff_id: '3',
    assigned_staff: { full_name: 'Babatunde Adeyemi' },
    ...computeSlot(-2, 15, 0, 30),
    status: 'no_show',
    name: 'Eunice W.',
    email: 'eunice.w@example.com.gh',
    phone: '+233 24 123 4567',
    avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80',
    country: 'Ghana',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-eunice-w',
    note: 'Ghanaian client exploring IVF clinic options in Nigeria.',
    internal_notes: 'Client did not connect on Google Meet. Sent automated follow-up email and WhatsApp invite to reschedule.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },

  // --- 2 Cancelled Consultations ---
  {
    id: 'bk-12',
    consultation_type_id: 'ct-3',
    consultation_type: { name: 'Egg Donor Information Call', duration_min: 20, price_minor: 0, currency: 'NGN' },
    staff_id: '2',
    assigned_staff: { full_name: 'Amara Okafor' },
    ...computeSlot(-6, 15, 0, 20),
    status: 'cancelled',
    name: 'Chioma E.',
    email: 'chioma.e@example.com',
    phone: '+234 703 111 2233',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    country: 'Nigeria',
    audience: 'Egg Donor',
    channel: 'Phone call',
    meeting_url: null,
    note: 'Rescheduling requested due to university semester exam timetable.',
    internal_notes: 'Candidate requested postponement until end of semester. Re-engagement flag set for next month.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 'bk-13',
    consultation_type_id: 'ct-1',
    consultation_type: { name: 'Intended Parent Consultation', duration_min: 30, price_minor: 0, currency: 'NGN' },
    staff_id: '1',
    assigned_staff: { full_name: 'Chizaram Ata' },
    ...computeSlot(-1, 13, 0, 30),
    status: 'cancelled',
    name: 'Mark & Elena V.',
    email: 'elena.mark.v@example.de',
    phone: '+49 170 1234567',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
    country: 'Germany',
    audience: 'Intended Parent',
    channel: 'Google Meet',
    meeting_url: 'https://meet.google.com/zizo-mark-elena',
    note: 'Munich-based intended parents inquiring on cross-border surrogacy feasibility.',
    internal_notes: 'Cancelled by client due to sudden international travel. Will rebook via client portal.',
    payment_status: 'not_required',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const loadInitialBookings = (): Booking[] => {
  if (typeof window === 'undefined') return generateDummyBookings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const nowIso = new Date().toISOString();
        const hasUpcoming = parsed.some((b: Booking) => b.status !== 'cancelled' && b.start_at >= nowIso);
        if (hasUpcoming) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse bookings from localStorage', e);
  }
  const fresh = generateDummyBookings();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {}
  return fresh;
};

export const BookingsPage: React.FC = () => {
  const { toast } = useNotifications();
  const { isOwner } = usePermissions();

  const [bookings, setBookings] = useState<Booking[]>(() => loadInitialBookings());
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled' | 'all'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings to localStorage', e);
    }
  }, [bookings]);

  const handleResetDemoData = () => {
    const fresh = generateDummyBookings();
    setBookings(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
    toast('Demo Data Restored', 'Reset bookings to 13 realistic active consultations.', 'info');
  };

  // Drawer & modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Editable fields inside Booking details drawer
  const [editMeetingUrl, setEditMeetingUrl] = useState('');
  const [editInternalNotes, setEditInternalNotes] = useState('');
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Create booking drawer state
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAudience, setNewAudience] = useState('Intended Parent');
  const [newConsultationTypeId, setNewConsultationTypeId] = useState('ct-1');
  const [newCountry, setNewCountry] = useState('Nigeria');
  const [newAppointmentDate, setNewAppointmentDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [newAppointmentTime, setNewAppointmentTime] = useState('10:00');
  const [newChannel, setNewChannel] = useState('Google Meet');
  const [newMeetingUrl, setNewMeetingUrl] = useState('');
  const [newStaffId, setNewStaffId] = useState('1');
  const [newNote, setNewNote] = useState('');

  const handleOpenBookingDetails = (b: Booking) => {
    setSelectedBooking(b);
    setEditMeetingUrl(b.meeting_url || '');
    setEditInternalNotes(b.internal_notes || '');
    setIsEditingMeeting(false);
    setIsEditingNotes(false);
  };

  const handleSaveMeetingUrl = () => {
    if (!selectedBooking) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === selectedBooking.id ? { ...b, meeting_url: editMeetingUrl } : b))
    );
    setSelectedBooking((prev) => (prev ? { ...prev, meeting_url: editMeetingUrl } : null));
    setIsEditingMeeting(false);
    toast('Meeting Link Saved', 'Consultation meeting URL has been updated.', 'success');
  };

  const handleSaveInternalNotes = () => {
    if (!selectedBooking) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === selectedBooking.id ? { ...b, internal_notes: editInternalNotes } : b))
    );
    setSelectedBooking((prev) => (prev ? { ...prev, internal_notes: editInternalNotes } : null));
    setIsEditingNotes(false);
    toast('Notes Saved', 'Internal coordinator notes have been updated.', 'success');
  };

  // Filter bookings by active tab
  const now = new Date().toISOString();
  const tabCounts = {
    upcoming: bookings.filter((b) => b.status !== 'cancelled' && b.start_at >= now).length,
    past: bookings.filter((b) => b.status === 'completed' || (b.start_at < now && b.status !== 'cancelled')).length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    all: bookings.length,
  };
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
    setSelectedBooking(null);
    toast('Status Updated', `Booking status changed to ${newStatus.replace('_', ' ')}.`, 'success');
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

  const columns = React.useMemo<ColumnDef<Booking>[]>(
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
                  onClick: () => handleOpenBookingDetails(b),
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
  ], [isOwner]);

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
              variant="secondary"
              onClick={handleResetDemoData}
              iconLeading={<RefreshCw01 className="w-4 h-4" />}
              title="Reset consultation bookings to 13 realistic samples"
            >
              Reset Demo Data
            </Button>

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
            className={`pb-3 capitalize border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab
                ? 'border-[#17645F] text-[#17645F] font-semibold'
                : 'border-transparent text-[#5D5E5F] hover:text-[#17191A]'
            }`}
          >
            <span>{tab}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                activeTab === tab
                  ? 'bg-[#17645F]/10 text-[#17645F]'
                  : 'bg-[#F2F1EE] text-[#5D5E5F]'
              }`}
            >
              {tabCounts[tab]}
            </span>
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Assigned Coordinator</span>
                <span className="text-xs font-semibold text-[#17191A]">
                  {selectedBooking.assigned_staff?.full_name || 'Chizaram Ata'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Target Audience</span>
                <Badge variant="brand" size="sm">{selectedBooking.audience || 'Intended Parent'}</Badge>
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

            {/* Virtual Meeting Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                  Virtual Meeting Link
                </h4>
                {!isEditingMeeting && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMeetingUrl(selectedBooking.meeting_url || '');
                      setIsEditingMeeting(true);
                    }}
                    className="text-xs text-[#17645F] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <Edit01 className="w-3.5 h-3.5" />
                    <span>Edit Link</span>
                  </button>
                )}
              </div>

              {isEditingMeeting ? (
                <div className="space-y-2 p-3 bg-[#FAF9F6] rounded-[8px] border border-[#E1E0DD]">
                  <Input
                    label="Meeting URL or Room Access"
                    value={editMeetingUrl}
                    onChange={(e) => setEditMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditingMeeting(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSaveMeetingUrl}>
                      Save Link
                    </Button>
                  </div>
                </div>
              ) : selectedBooking.meeting_url ? (
                <div className="p-3 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] flex items-center justify-between gap-2">
                  <a
                    href={selectedBooking.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#17645F] font-mono hover:underline truncate"
                  >
                    {selectedBooking.meeting_url}
                  </a>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedBooking.meeting_url || '');
                        toast('Copied', 'Meeting URL copied to clipboard.', 'info');
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.open(selectedBooking.meeting_url || '', '_blank')}
                    >
                      Join Call
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8E8F90] italic p-2.5 bg-[#FAF9F6] rounded-[8px] border border-dashed border-[#E1E0DD]">
                  No virtual meeting link attached yet. Click &quot;Edit Link&quot; above to set a Google Meet or Zoom link.
                </p>
              )}
            </div>

            {selectedBooking.note && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                  Client Intake Notes
                </h4>
                <p className="p-3 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] text-xs text-[#2E3031] leading-relaxed">
                  {selectedBooking.note}
                </p>
              </div>
            )}

            {/* Internal Staff Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                  Internal Coordinator Notes
                </h4>
                {!isEditingNotes && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditInternalNotes(selectedBooking.internal_notes || '');
                      setIsEditingNotes(true);
                    }}
                    className="text-xs text-[#17645F] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <Edit01 className="w-3.5 h-3.5" />
                    <span>Edit Notes</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2 p-3 bg-[#FAF9F6] rounded-[8px] border border-[#E1E0DD]">
                  <Textarea
                    label="Internal Clinical &amp; Scheduling Notes (Staff only)"
                    rows={3}
                    value={editInternalNotes}
                    onChange={(e) => setEditInternalNotes(e.target.value)}
                    placeholder="Candidate background, special requests, legal questions..."
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditingNotes(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSaveInternalNotes}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="p-3 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] text-xs text-[#2E3031] leading-relaxed">
                  {selectedBooking.internal_notes || 'No internal coordinator notes logged for this appointment.'}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#E1E0DD] flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
              >
                Mark Completed
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRescheduleModalOpen(true)}
              >
                Reschedule
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange(selectedBooking.id, 'no_show')}
              >
                Mark No-Show
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
        description="Book a verified appointment for an intended parent, surrogate, or egg donor."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const selType = CONSULTATION_TYPES.find((c) => c.id === newConsultationTypeId) || CONSULTATION_TYPES[0];
            const selStaff = STAFF_MEMBERS.find((s) => s.id === newStaffId) || STAFF_MEMBERS[0];
            const startIso = `${newAppointmentDate}T${newAppointmentTime}:00Z`;
            const endIso = new Date(new Date(startIso).getTime() + selType.duration_min * 60000).toISOString();

            const newBk: Booking = {
              id: 'bk-' + Date.now(),
              consultation_type_id: selType.id,
              consultation_type: { name: selType.name, duration_min: selType.duration_min, price_minor: 0, currency: 'NGN' },
              staff_id: selStaff.id,
              assigned_staff: { full_name: selStaff.full_name },
              start_at: startIso,
              end_at: endIso,
              status: 'confirmed',
              name: newName,
              email: newEmail,
              phone: newPhone,
              country: newCountry,
              audience: newAudience,
              channel: newChannel,
              meeting_url: newMeetingUrl.trim() || (newChannel === 'Google Meet' ? 'https://meet.google.com/zizo-consult' : null),
              note: newNote.trim() || null,
              internal_notes: 'Created manually by coordinator.',
              payment_status: 'not_required',
              created_at: new Date().toISOString(),
            };
            setBookings((prev) => [newBk, ...prev]);
            toast('Booking Created', `Scheduled ${selType.name} for ${newName}.`, 'success');
            setCreateDrawerOpen(false);
            setNewName('');
            setNewEmail('');
            setNewPhone('');
            setNewMeetingUrl('');
            setNewNote('');
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Client Name" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name" />
            <Select
              label="Audience Type"
              value={newAudience}
              onChange={(e) => setNewAudience(e.target.value)}
              options={[
                { value: 'Intended Parent', label: 'Intended Parent' },
                { value: 'Surrogate', label: 'Surrogate' },
                { value: 'Egg Donor', label: 'Egg Donor' },
                { value: 'General', label: 'General / Healthcare Partner' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Client Email" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="client@example.com" />
            <Input label="Phone Number" type="tel" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+234..." />
          </div>

          <Select
            label="Consultation Type"
            value={newConsultationTypeId}
            onChange={(e) => setNewConsultationTypeId(e.target.value)}
            options={CONSULTATION_TYPES.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.duration_min} min)`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Country / Region"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              options={[
                { value: 'Nigeria', label: 'Nigeria (Domestic)' },
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
              label="Assigned Coordinator"
              value={newStaffId}
              onChange={(e) => setNewStaffId(e.target.value)}
              options={STAFF_MEMBERS.map((s) => ({
                value: s.id,
                label: s.full_name,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Appointment Date"
              type="date"
              required
              value={newAppointmentDate}
              onChange={(e) => setNewAppointmentDate(e.target.value)}
            />
            <Select
              label="Time Slot (WAT, UTC+1)"
              value={newAppointmentTime}
              onChange={(e) => setNewAppointmentTime(e.target.value)}
              options={[
                { value: '09:00', label: '09:00 AM WAT' },
                { value: '10:00', label: '10:00 AM WAT' },
                { value: '11:00', label: '11:00 AM WAT' },
                { value: '12:00', label: '12:00 PM WAT' },
                { value: '14:00', label: '02:00 PM WAT' },
                { value: '15:00', label: '03:00 PM WAT' },
                { value: '16:00', label: '04:00 PM WAT' },
                { value: '17:00', label: '05:00 PM WAT' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Consultation Channel"
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              options={[
                { value: 'Google Meet', label: 'Google Meet' },
                { value: 'WhatsApp call', label: 'WhatsApp call' },
                { value: 'Phone call', label: 'Direct Phone call' },
              ]}
            />
            <Input
              label="Virtual Meeting Link (Optional)"
              value={newMeetingUrl}
              onChange={(e) => setNewMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <Textarea
            label="Intake &amp; Clinical Background Notes"
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Key discussion topics or medical history..."
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-[#E1E0DD]">
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
