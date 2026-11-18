import React, { useState } from 'react';
import { PageHeader } from '../components/untitledui/PageHeader';
import { Button } from '../components/untitledui/Button';
import { Badge } from '../components/untitledui/Badge';
import { Toggle } from '../components/untitledui/Toggle';
import { Input } from '../components/untitledui/Input';
import { Textarea } from '../components/untitledui/Textarea';
import { Select } from '../components/untitledui/Select';
import { Drawer } from '../components/untitledui/Drawer';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { Plus } from '@untitledui/icons';
import type { ConsultationType } from '../types';

const INITIAL_TYPES: ConsultationType[] = [
  {
    id: 'ct-1',
    name: 'Intended Parent Consultation',
    slug: 'intended-parent-consultation',
    duration_min: 30,
    buffer_min: 10,
    channels: ['Google Meet', 'Phone call', 'WhatsApp call'],
    price_minor: 0,
    currency: 'NGN',
    intro: 'Private exploration of surrogacy or ovum donation options and legal contracts.',
    active: true,
    sort: 1,
    bookings_count: 24,
    updated_at: '2026-02-10',
  },
  {
    id: 'ct-2',
    name: 'Surrogate Information Call',
    slug: 'surrogate-information-call',
    duration_min: 20,
    buffer_min: 10,
    channels: ['Google Meet', 'Phone call', 'WhatsApp call'],
    price_minor: 0,
    currency: 'NGN',
    intro: 'Confidential conversation about eligibility, screening, medical steps, and care.',
    active: true,
    sort: 2,
    bookings_count: 18,
    updated_at: '2026-02-12',
  },
  {
    id: 'ct-3',
    name: 'Egg Donor Information Call',
    slug: 'egg-donor-information-call',
    duration_min: 20,
    buffer_min: 10,
    channels: ['Google Meet', 'Phone call', 'WhatsApp call'],
    price_minor: 0,
    currency: 'NGN',
    intro: 'Private guidance on ovum donation, anonymity, testing, and care support.',
    active: true,
    sort: 3,
    bookings_count: 9,
    updated_at: '2026-02-14',
  },
  {
    id: 'ct-4',
    name: 'Cost and Program Planning',
    slug: 'cost-and-program-planning',
    duration_min: 45,
    buffer_min: 15,
    channels: ['Google Meet', 'Phone call'],
    price_minor: 0,
    currency: 'NGN',
    intro: 'Structured cost planning session tailored to international clinics.',
    active: true,
    sort: 4,
    bookings_count: 14,
    updated_at: '2026-02-16',
  },
];

export const ConsultationTypesPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [types, setTypes] = useState<ConsultationType[]>(INITIAL_TYPES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<ConsultationType | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [duration, setDuration] = useState('30');
  const [buffer, setBuffer] = useState('10');
  const [channels, setChannels] = useState<string[]>(['Google Meet', 'Phone call', 'WhatsApp call']);
  const [priceMinor, setPriceMinor] = useState('0');
  const [currency, setCurrency] = useState('NGN');
  const [intro, setIntro] = useState('');
  const [active, setActive] = useState(true);

  // Delete modal state
  const [typeToDelete, setTypeToDelete] = useState<ConsultationType | null>(null);

  const openCreateDrawer = () => {
    setEditingType(null);
    setName('');
    setSlug('');
    setDuration('30');
    setBuffer('10');
    setChannels(['Google Meet', 'Phone call', 'WhatsApp call']);
    setPriceMinor('0');
    setCurrency('NGN');
    setIntro('');
    setActive(true);
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: ConsultationType) => {
    setEditingType(item);
    setName(item.name);
    setSlug(item.slug);
    setDuration(String(item.duration_min));
    setBuffer(String(item.buffer_min));
    setChannels(item.channels);
    setPriceMinor(String(item.price_minor / 100));
    setCurrency(item.currency);
    setIntro(item.intro);
    setActive(item.active);
    setDrawerOpen(true);
  };

  const handleToggleActive = (id: string, current: boolean) => {
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !current } : t))
    );
    toast('Consultation Updated', `Consultation status changed.`, 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData: ConsultationType = {
      id: editingType ? editingType.id : 'ct-' + Date.now(),
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      duration_min: Number(duration),
      buffer_min: Number(buffer),
      channels,
      price_minor: Number(priceMinor) * 100,
      currency,
      intro,
      active,
      sort: editingType ? editingType.sort : types.length + 1,
      bookings_count: editingType ? editingType.bookings_count : 0,
      updated_at: new Date().toISOString().split('T')[0],
    };

    if (editingType) {
      setTypes((prev) => prev.map((t) => (t.id === editingType.id ? itemData : t)));
      toast('Consultation Type Saved', `Updated ${name}.`, 'success');
    } else {
      setTypes((prev) => [...prev, itemData]);
      toast('Consultation Type Created', `Added ${name}.`, 'success');
    }

    logAction({
      action: editingType ? 'EDIT_CONSULTATION_TYPE' : 'CREATE_CONSULTATION_TYPE',
      tableName: 'consultation_types',
      recordId: itemData.id,
      diff: itemData,
    });

    setDrawerOpen(false);
  };

  const handleDelete = () => {
    if (!typeToDelete) return;
    if (typeToDelete.bookings_count && typeToDelete.bookings_count > 0) {
      toast(
        'Deletion Blocked',
        `Cannot delete "${typeToDelete.name}" because active or past bookings reference it. Deactivate instead.`,
        'error'
      );
      setTypeToDelete(null);
      return;
    }

    setTypes((prev) => prev.filter((t) => t.id !== typeToDelete.id));
    toast('Deleted', `Deleted ${typeToDelete.name}.`, 'info');
    setTypeToDelete(null);
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Consultation Types"
        description="Manage the conversation offerings available to intended parents, surrogates, and donors."
        breadcrumbs={[{ label: 'Staff Portal', href: '/' }, { label: 'Consultation Types' }]}
        actions={
          <Button onClick={openCreateDrawer} iconLeading={<Plus className="w-4 h-4" />}>
            New Consultation Type
          </Button>
        }
      />

      <div className="rounded-[10px] border border-[#E1E0DD] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2E3031]">
            <thead className="bg-[#FAF9F6] text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider border-b border-[#E1E0DD]">
              <tr>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Buffer</th>
                <th className="px-4 py-3.5">Channels</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Active</th>
                <th className="px-4 py-3.5">Bookings</th>
                <th className="px-4 py-3.5">Updated</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E0DD] bg-white">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-semibold text-sm text-[#17191A]">{t.name}</p>
                      <p className="text-xs text-[#5D5E5F] line-clamp-1">{t.intro}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#17645F] font-semibold">
                    {t.duration_min} min
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#5D5E5F]">
                    {t.buffer_min} min
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {t.channels.map((ch) => (
                        <Badge key={ch} variant="gray" size="sm">
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-xs text-[#17191A]">
                    {t.price_minor === 0 ? 'Free' : `₦${(t.price_minor / 100).toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3.5">
                    <Toggle
                      size="sm"
                      checked={t.active}
                      onChange={() => handleToggleActive(t.id, t.active)}
                    />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#5D5E5F]">
                    {t.bookings_count || 0}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#5D5E5F]">{t.updated_at}</td>
                  <td className="px-4 py-3.5 text-right">
                    <RowActionsMenu
                      rowLabel={t.name}
                      items={[
                        {
                          id: 'edit',
                          label: 'Edit',
                          onClick: () => openEditDrawer(t),
                        },
                        {
                          id: 'duplicate',
                          label: 'Duplicate',
                          onClick: () => {
                            const copy: ConsultationType = {
                              ...t,
                              id: 'ct-' + Date.now(),
                              name: `${t.name} (Copy)`,
                              slug: `${t.slug}-copy`,
                              bookings_count: 0,
                            };
                            setTypes((prev) => [...prev, copy]);
                            toast('Duplicated', `Created copy of ${t.name}`, 'info');
                          },
                        },
                        {
                          id: 'toggle',
                          label: t.active ? 'Deactivate' : 'Activate',
                          onClick: () => handleToggleActive(t.id, t.active),
                        },
                        {
                          id: 'delete',
                          label: 'Delete',
                          destructive: true,
                          dividerAbove: true,
                          onClick: () => setTypeToDelete(t),
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

      {/* Drawer for Create / Edit */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingType ? 'Edit Consultation Type' : 'New Consultation Type'}
        description="Configure duration, channels, buffers, and fee details."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingType ? 'Save Changes' : 'Create Type'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Consultation Name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingType) {
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }
            }}
            placeholder="e.g. Intended Parent Consultation"
          />

          <Input
            label="URL Slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <Textarea
            label="Introduction &amp; Scope"
            required
            rows={3}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="What will be discussed during this appointment..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (Minutes)"
              type="number"
              min={5}
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Input
              label="Buffer After (Minutes)"
              type="number"
              min={0}
              required
              value={buffer}
              onChange={(e) => setBuffer(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#17191A]">Available Channels</label>
            <div className="space-y-2">
              {['Google Meet', 'Phone call', 'WhatsApp call'].map((ch) => (
                <label key={ch} className="flex items-center gap-2.5 text-xs text-[#17191A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.includes(ch)}
                    onChange={(e) => {
                      if (e.target.checked) setChannels((prev) => [...prev, ch]);
                      else setChannels((prev) => prev.filter((c) => c !== ch));
                    }}
                    className="w-4 h-4 accent-[#17645F]"
                  />
                  <span>{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fee Amount (NGN)"
              type="number"
              min={0}
              value={priceMinor}
              onChange={(e) => setPriceMinor(e.target.value)}
              helperText="Set 0 for free consultations."
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[{ value: 'NGN', label: 'NGN (Nigerian Naira)' }]}
            />
          </div>

          <div className="pt-2">
            <Toggle
              checked={active}
              onChange={setActive}
              label="Active &amp; Bookable"
              description="Whether this consultation is bookable by the public."
            />
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(typeToDelete)}
        onClose={() => setTypeToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Consultation Type"
        description={`Are you sure you want to delete "${typeToDelete?.name}"? If bookings exist, you should deactivate it instead.`}
        confirmLabel="Delete Type"
      />
    </div>
  );
};
