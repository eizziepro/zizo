import React, { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Toggle } from '../components/untitledui/Toggle';
import { Badge } from '../components/untitledui/Badge';
import { Button } from '../components/untitledui/Button';
import { Drawer } from '../components/untitledui/Drawer';
import { Input } from '../components/untitledui/Input';
import { Textarea } from '../components/untitledui/Textarea';
import { Select } from '../components/untitledui/Select';
import { ImageUpload } from '../components/untitledui/ImageUpload';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { Plus, HelpCircle, Eye, LayersThree01 } from '@untitledui/icons';
import type { ServiceItem } from '../types';

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    slug: 'donor-and-surrogate-enquiry',
    title: 'Donor and Surrogate Enquiry',
    short_description: 'Initial matching discovery, process guidance, and eligibility consultation.',
    body_md: '## Donor and Surrogate Enquiry\n\nComprehensive exploration of gestational carrier profiles, ovum donor selection, and initial legal steps in Nigeria and internationally.',
    price_amount: 10000,
    price_currency: 'NGN',
    price_label: 'Fixed Fee',
    show_price: true,
    status: 'published',
    featured: true,
    sort_order: 1,
    faqs_count: 4,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-02-18',
  },
  {
    id: 'srv-2',
    slug: 'ivf-consultation-and-coordination',
    title: 'IVF Consultation and Clinic Coordination',
    short_description: 'Accredited fertility clinic scheduling, medical protocol alignment, and escort.',
    body_md: '## IVF Consultation and Coordination\n\nDirect synchronization between intended parents and verified fertility centers in Lagos, Abuja, and partner international jurisdictions.',
    price_amount: 60000,
    price_currency: 'NGN',
    price_label: 'Coordination Fee',
    show_price: true,
    status: 'published',
    featured: true,
    sort_order: 2,
    faqs_count: 5,
    created_at: '2026-01-22T10:00:00Z',
    updated_at: '2026-02-18',
  },
  {
    id: 'srv-3',
    slug: 'surrogacy-coordination',
    title: 'Surrogacy Coordination',
    short_description: 'End-to-end gestational carrier care, contract facilitation, and birth logistics.',
    body_md: '## Surrogacy Coordination Program\n\nFull administrative, accommodation, maternal wellness, and legal parentage coordination from contract signing through post-birth documentation.',
    price_amount: 50000,
    price_currency: 'NGN',
    price_label: 'Program Retainer',
    show_price: true,
    status: 'published',
    featured: true,
    sort_order: 3,
    faqs_count: 6,
    created_at: '2026-01-25T10:00:00Z',
    updated_at: '2026-02-18',
  },
  {
    id: 'srv-4',
    slug: 'donor-profiling-and-screening',
    title: 'Donor Profiling and Screening',
    short_description: 'Anonymized donor catalog access, phenotype matching, and health audit.',
    body_md: '## Donor Profiling & Screening\n\nThorough phenotypic, genetic, viral, and psychological evaluation of egg and sperm donors complying with clinical reproductive guidelines.',
    price_amount: 0,
    price_currency: 'NGN',
    price_label: 'Complimentary',
    show_price: true,
    status: 'published',
    featured: true,
    sort_order: 4,
    faqs_count: 3,
    created_at: '2026-01-28T10:00:00Z',
    updated_at: '2026-02-18',
  },
];

export const ServicesPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [viewingService, setViewingService] = useState<ServiceItem | null>(null);
  const [editorTab, setEditorTab] = useState<'overview' | 'content' | 'pricing' | 'seo' | 'faqs'>('overview');

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [linkedConsultationType, setLinkedConsultationType] = useState<string>('');
  const [priceAmount, setPriceAmount] = useState('0');
  const [priceCurrency, setPriceCurrency] = useState('NGN');
  const [priceLabel, setPriceLabel] = useState('From');
  const [showPrice, setShowPrice] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [featured, setFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');

  // Delete modal
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  const openCreate = () => {
    setEditingService(null);
    setTitle('');
    setSlug('');
    setShortDesc('');
    setBodyMd('');
    setImagePath(null);
    setImageAlt('');
    setLinkedConsultationType('');
    setPriceAmount('0');
    setPriceCurrency('NGN');
    setPriceLabel('From');
    setShowPrice(true);
    setServiceStatus('published');
    setFeatured(false);
    setMetaTitle('');
    setMetaDesc('');
    setEditorTab('overview');
    setEditorOpen(true);
  };

  const openEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setTitle(srv.title);
    setSlug(srv.slug);
    setShortDesc(srv.short_description);
    setBodyMd(srv.body_md);
    setImagePath(srv.image_path || null);
    setImageAlt(srv.image_alt || '');
    setLinkedConsultationType(srv.linked_consultation_type_id || '');
    setPriceAmount(String(srv.price_amount));
    setPriceCurrency(srv.price_currency);
    setPriceLabel(srv.price_label);
    setShowPrice(srv.show_price);
    setServiceStatus(srv.status);
    setFeatured(srv.featured);
    setMetaTitle(srv.seo?.meta_title || '');
    setMetaDesc(srv.seo?.meta_description || '');
    setEditorTab('overview');
    setEditorOpen(true);
  };

  const handleToggleFeatured = (id: string, current: boolean) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, featured: !current } : s))
    );
    toast('Featured Updated', 'Service display priority updated.', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData: ServiceItem = {
      id: editingService ? editingService.id : 'srv-' + Date.now(),
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      short_description: shortDesc,
      body_md: bodyMd,
      image_path: imagePath,
      image_alt: imageAlt.trim() || null,
      linked_consultation_type_id: linkedConsultationType || null,
      price_amount: Number(priceAmount),
      price_currency: priceCurrency,
      price_label: priceLabel,
      show_price: showPrice,
      status: serviceStatus,
      featured,
      sort_order: editingService ? editingService.sort_order : services.length + 1,
      seo: {
        meta_title: metaTitle,
        meta_description: metaDesc,
      },
      faqs_count: editingService ? editingService.faqs_count : 0,
      created_at: editingService ? editingService.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString().split('T')[0],
    };

    if (editingService) {
      setServices((prev) => prev.map((s) => (s.id === editingService.id ? itemData : s)));
      toast('Service Updated', `Saved changes to ${title}. Deploy hook triggered.`, 'success');
    } else {
      setServices((prev) => [...prev, itemData]);
      toast('Service Created', `Created ${title}. Deploy hook triggered.`, 'success');
    }

    logAction({
      action: editingService ? 'EDIT_SERVICE' : 'CREATE_SERVICE',
      tableName: 'services',
      recordId: itemData.id,
      diff: itemData,
    });

    setEditorOpen(false);
  };

  const handleDelete = () => {
    if (!serviceToDelete) return;
    setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
    logAction({
      action: 'DELETE_SERVICE',
      tableName: 'services',
      recordId: serviceToDelete.id,
    });
    toast('Service Deleted', `Removed ${serviceToDelete.title}.`, 'info');
    setServiceToDelete(null);
  };

  const columns = React.useMemo<ColumnDef<ServiceItem>[]>(
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
      accessorKey: 'title',
      header: 'Service',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[160px]">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2ECEB] text-[#17645F] flex items-center justify-center shrink-0">
              <LayersThree01 className="w-4 h-4" />
            </div>
            <div className="truncate max-w-[180px]">
              <p className="font-semibold text-sm text-[#17191A] truncate">{s.title}</p>
              <p className="text-xs font-mono text-[#5D5E5F] truncate">/{s.slug}/</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'price_amount',
      header: 'Price',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-xs whitespace-nowrap">
            <span className="font-semibold text-[#17191A]">
              {s.price_amount === 0 ? 'Free' : `₦${s.price_amount.toLocaleString()}`}
            </span>
            <span className="text-[10px] text-[#5D5E5F] block">{s.price_label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'faqs_count',
      header: 'FAQs Attached',
      cell: ({ row }) => (
        <Badge variant="gray" size="sm">
          {row.original.faqs_count || 0} FAQs
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'featured',
      header: 'Featured',
      cell: ({ row }) => (
        <Toggle
          size="sm"
          checked={row.original.featured}
          onChange={() => handleToggleFeatured(row.original.id, row.original.featured)}
        />
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-[#5D5E5F] whitespace-nowrap">{row.original.updated_at}</span>
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
              rowLabel={s.title}
              items={[
                {
                  id: 'view',
                  label: 'View service',
                  onClick: () => setViewingService(s),
                },
                {
                  id: 'edit',
                  label: 'Edit service',
                  onClick: () => openEdit(s),
                },
                {
                  id: 'preview',
                  label: 'Preview on public site',
                  onClick: () => window.open(`/services/${s.slug}/`, '_blank'),
                },
                {
                  id: 'manage-faqs',
                  label: 'Manage attached FAQs',
                  onClick: () => {
                    openEdit(s);
                    setEditorTab('faqs');
                  },
                },
                {
                  id: 'duplicate',
                  label: 'Duplicate',
                  onClick: () => {
                    const copy: ServiceItem = {
                      ...s,
                      id: 'srv-' + Date.now(),
                      title: `${s.title} (Copy)`,
                      slug: `${s.slug}-copy`,
                    };
                    setServices((prev) => [...prev, copy]);
                    toast('Duplicated', `Created duplicate of ${s.title}`, 'info');
                  },
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  destructive: true,
                  dividerAbove: true,
                  onClick: () => setServiceToDelete(s),
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
        title="Services Management"
        description="Clinical packages, consultation programs, and public pricing tiers."
        actions={
          <Button onClick={openCreate} iconLeading={<Plus className="w-4 h-4" />}>
            New Service
          </Button>
        }
      />

      <DataTable
        data={services}
        columns={columns}
        searchPlaceholder="Search services by title, slug, price..."
        onRowClick={(row) => setViewingService(row)}
      />

      {/* Drawer for View Service Details */}
      <Drawer
        isOpen={Boolean(viewingService)}
        onClose={() => setViewingService(null)}
        width="2xl"
        title="Service Package Details"
        description="Comprehensive clinical program overview, pricing, and attached resources."
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewingService(null)}>
              Close
            </Button>
            {viewingService && (
              <Button
                variant="primary"
                onClick={() => {
                  const s = viewingService;
                  setViewingService(null);
                  openEdit(s);
                }}
              >
                Edit Service
              </Button>
            )}
          </>
        }
      >
        {viewingService && (
          <div className="space-y-6 text-left">
            <div>
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider block">
                Clinical Program
              </span>
              <h3 className="text-xl font-semibold text-[#17191A] mt-1">{viewingService.title}</h3>
              <p className="text-xs font-mono text-[#5D5E5F] mt-0.5">Slug: /{viewingService.slug}/</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={viewingService.status} />
              <Badge variant="brand" size="sm">
                {viewingService.price_amount === 0 ? 'Free' : `₦${viewingService.price_amount.toLocaleString()}`} {viewingService.price_label}
              </Badge>
              <Badge variant="gray" size="sm">
                {viewingService.faqs_count || 0} Attached FAQs
              </Badge>
              {viewingService.featured && (
                <Badge variant="success" size="sm">
                  Featured on Homepage
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider block">
                Short Description
              </span>
              <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] text-sm text-[#2E3031] leading-relaxed">
                {viewingService.short_description}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider block">
                Full Package Overview
              </span>
              <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] text-sm text-[#2E3031] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-sans">
                {viewingService.body_md}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E1E0DD] text-xs text-[#5D5E5F]">
              <div>
                <span className="font-semibold block text-[#17191A]">SEO Meta Title</span>
                <span className="truncate block">{viewingService.seo?.meta_title || 'Default'}</span>
              </div>
              <div>
                <span className="font-semibold block text-[#17191A]">Last Updated</span>
                <span>{viewingService.updated_at}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Full-Page Tabbed Drawer Editor */}
      <Drawer
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        width="2xl"
        title={editingService ? `Edit ${editingService.title}` : 'Create New Service'}
        description="Configure overview, rich Markdown clinical content, pricing, and SEO."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save &amp; Publish Service
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Editor sub-tabs */}
          <div className="border-b border-[#E1E0DD] flex gap-3 text-xs font-semibold uppercase tracking-wider">
            {(['overview', 'content', 'pricing', 'seo', 'faqs'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setEditorTab(tab)}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  editorTab === tab
                    ? 'border-[#17645F] text-[#17645F]'
                    : 'border-transparent text-[#5D5E5F] hover:text-[#17191A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB: Overview */}
          {editorTab === 'overview' && (
            <div className="space-y-4">
              <Input
                label="Service Title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingService) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                  }
                }}
                placeholder="e.g. IVF Consultation and Clinic Coordination"
              />

              <Input
                label="URL Slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <Textarea
                label="Short Description (8-10 words)"
                required
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Accredited fertility clinic scheduling and medical protocol coordination."
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Publishing Status"
                  value={serviceStatus}
                  onChange={(e) => setServiceStatus(e.target.value as any)}
                  options={[
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />

                <div className="pt-7">
                  <Toggle
                    checked={featured}
                    onChange={setFeatured}
                    label="Feature on Homepage Bento Grid"
                  />
                </div>
              </div>

              <Select
                label="Linked Consultation Type"
                value={linkedConsultationType}
                onChange={(e) => setLinkedConsultationType(e.target.value)}
                options={[
                  { value: '', label: 'None (Direct inquiry routing)' },
                  { value: 'ct-1', label: 'Intended Parent Consultation (30 mins)' },
                  { value: 'ct-2', label: 'Surrogate Information Call (20 mins)' },
                  { value: 'ct-3', label: 'Egg Donor Information Call (20 mins)' },
                  { value: 'ct-4', label: 'Cost and Program Planning (45 mins)' },
                ]}
              />

              <ImageUpload
                label="Service Card &amp; Header Image"
                helperText="Upload image representing this clinical service."
                value={imagePath}
                onChange={setImagePath}
              />

              <Input
                label="Image Alt Text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Accessibility description for this service image..."
              />
            </div>
          )}

          {/* TAB: Content */}
          {editorTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#17191A] mb-1.5">
                  Clinical Body Content (Markdown)
                </label>
                <p className="text-xs text-[#5D5E5F] mb-2">
                  Supports bold, italic, bullet lists, subheadings, and internal links.
                </p>
                <textarea
                  rows={12}
                  value={bodyMd}
                  onChange={(e) => setBodyMd(e.target.value)}
                  className="w-full font-mono text-xs rounded-[8px] border border-[#E1E0DD] p-3 focus:outline-none focus:ring-2 focus:ring-[#17645F]"
                  placeholder="## Who this is for...&#10;&#10;### What is included...&#10;- Clinical matching&#10;- Escort and logistics"
                />
              </div>
            </div>
          )}

          {/* TAB: Pricing */}
          {editorTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fee Amount (NGN)"
                  type="number"
                  min={0}
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  helperText="Enter 0 for Free or complimentary."
                />
                <Select
                  label="Price Label"
                  value={priceLabel}
                  onChange={(e) => setPriceLabel(e.target.value)}
                  options={[
                    { value: 'From', label: 'From' },
                    { value: 'Fixed Fee', label: 'Fixed Fee' },
                    { value: 'Coordination Fee', label: 'Coordination Fee' },
                    { value: 'Complimentary', label: 'Complimentary' },
                  ]}
                />
              </div>

              <Toggle
                checked={showPrice}
                onChange={setShowPrice}
                label="Display Price on Public Card"
                description="When unchecked, the price badge is hidden on website cards."
              />
            </div>
          )}

          {/* TAB: SEO */}
          {editorTab === 'seo' && (
            <div className="space-y-4">
              <Input
                label="SEO Meta Title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={`${title} | Zizo Donor and Surrogacy`}
              />
              <Textarea
                label="SEO Meta Description"
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Safe, confidential fertility and surrogacy coordination across borders..."
              />
            </div>
          )}

          {/* TAB: FAQs */}
          {editorTab === 'faqs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#17191A]">Attached FAQs</h4>
                  <p className="text-xs text-[#5D5E5F]">
                    These questions render automatically in an accordion on this service&apos;s detail page.
                  </p>
                </div>
                <Button size="sm" variant="secondary" iconLeading={<Plus className="w-3.5 h-3.5" />}>
                  Attach Existing FAQ
                </Button>
              </div>

              <div className="p-4 rounded-[8px] border border-[#E1E0DD] bg-[#FAF9F6] text-xs text-[#5D5E5F] text-center">
                Manage all cross-page FAQ assignments in the primary FAQs registry.
              </div>
            </div>
          )}
        </div>
      </Drawer>

      <ConfirmModal
        isOpen={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Service Offering"
        description={`Are you sure you want to delete "${serviceToDelete?.title}"?`}
        confirmLabel="Delete Service"
      />
    </div>
  );
};
