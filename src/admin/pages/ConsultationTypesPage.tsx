import React, { useState, useEffect, useCallback } from 'react';
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

export const ConsultationTypesPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [types, setTypes] = useState<ConsultationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<ConsultationType | null>(null);
  const [expandedChannels, setExpandedChannels] = useState<Record<string, boolean>>({});

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

  const fetchTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/consultation-types');
      if (res.ok) {
        const data = await res.json();
        const mapped: ConsultationType[] = (data.types || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          duration_min: t.duration_min,
          buffer_min: t.buffer_min,
          channels: t.channels || ['Google Meet', 'Phone call'],
          price_minor: t.price_minor || 0,
          currency: t.currency || 'NGN',
          intro: t.intro || '',
          active: Boolean(t.active),
          sort: t.sort || 0,
          bookings_count: 0,
          updated_at: new Date().toISOString().split('T')[0],
        }));
        setTypes(mapped);
      }
    } catch (err) {
      console.error('Failed to load consultation types:', err);
      toast('Load Failed', 'Could not load consultation types from database.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

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

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/consultation-types/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ active: !current }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast('Consultation Updated', `Consultation status changed.`, 'info');
      fetchTypes();
    } catch {
      toast('Update Failed', 'Could not change active status.', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      duration_min: Number(duration),
      buffer_min: Number(buffer),
      channels,
      price_minor: Number(priceMinor) * 100,
      currency,
      intro,
      active,
    };

    try {
      if (editingType) {
        const res = await fetch(`/api/admin/consultation-types/${editingType.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update consultation type');
        toast('Consultation Type Saved', `Updated ${name}.`, 'success');
      } else {
        const res = await fetch('/api/admin/consultation-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create consultation type');
        toast('Consultation Type Created', `Added ${name}.`, 'success');
      }

      logAction({
        action: editingType ? 'EDIT_CONSULTATION_TYPE' : 'CREATE_CONSULTATION_TYPE',
        tableName: 'consultation_types',
        recordId: editingType?.id || 'new',
        diff: payload,
      });

      setDrawerOpen(false);
      fetchTypes();
    } catch {
      toast('Save Failed', 'Could not save consultation type to database.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    try {
      const res = await fetch(`/api/admin/consultation-types/${typeToDelete.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!res.ok) throw new Error('Failed to delete consultation type');
      toast('Deleted', `Deleted ${typeToDelete.name}.`, 'info');
      logAction({
        action: 'DELETE_CONSULTATION_TYPE',
        tableName: 'consultation_types',
        recordId: typeToDelete.id,
      });
      fetchTypes();
    } catch {
      toast('Delete Failed', 'Could not delete consultation type.', 'error');
    } finally {
      setTypeToDelete(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Consultation Types"
        description="Manage the conversation offerings available to intended parents, surrogates, and donors."
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
                <th className="px-4 py-3.5 whitespace-nowrap">Name</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Duration</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Channels</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Price</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Active</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Bookings</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E0DD] bg-white">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="max-w-xs">
                      <p className="font-semibold text-sm text-[#17191A] truncate">{t.name}</p>
                      <p className="text-xs text-[#5D5E5F] truncate">{t.intro}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#17645F] font-semibold whitespace-nowrap">
                    {t.duration_min} min
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {expandedChannels[t.id] ? (
                        <>
                          {t.channels.map((ch) => (
                            <Badge key={ch} variant="gray" size="sm">
                              {ch}
                            </Badge>
                          ))}
                          <button
                            type="button"
                            onClick={() => setExpandedChannels((prev) => ({ ...prev, [t.id]: false }))}
                            className="text-[11px] text-[#17645F] hover:underline font-semibold cursor-pointer ml-1"
                          >
                            Hide
                          </button>
                        </>
                      ) : (
                        <>
                          <Badge variant="gray" size="sm">
                            {t.channels[0]}
                          </Badge>
                          {t.channels.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setExpandedChannels((prev) => ({ ...prev, [t.id]: true }))}
                              className="text-[11px] text-[#17645F] hover:underline font-semibold cursor-pointer inline-flex items-center gap-0.5"
                              title="Click to reveal all consultation channels"
                            >
                              +{t.channels.length - 1} more
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-xs text-[#17191A] whitespace-nowrap">
                    {t.price_minor === 0 ? 'Free' : `₦${(t.price_minor / 100).toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Toggle
                      size="sm"
                      checked={t.active}
                      onChange={() => handleToggleActive(t.id, t.active)}
                    />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#5D5E5F] whitespace-nowrap">
                    {t.bookings_count || 0}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
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
