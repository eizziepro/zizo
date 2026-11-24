import React, { useState, useEffect, useCallback } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Badge } from '../components/untitledui/Badge';
import { Button } from '../components/untitledui/Button';
import { Drawer } from '../components/untitledui/Drawer';
import { Modal } from '../components/untitledui/Modal';
import { Input } from '../components/untitledui/Input';
import { Textarea } from '../components/untitledui/Textarea';
import { Select } from '../components/untitledui/Select';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { Plus, HelpCircle, LayersThree01 } from '@untitledui/icons';
import type { FAQ } from '../types';

const AVAILABLE_PAGES = [
  { type: 'service', ref: 'donor-and-surrogate-enquiry', label: 'Service: Donor and Surrogate Enquiry' },
  { type: 'service', ref: 'ivf-consultation-and-coordination', label: 'Service: IVF Consultation & Coordination' },
  { type: 'service', ref: 'surrogacy-coordination', label: 'Service: Surrogacy Coordination' },
  { type: 'service', ref: 'donor-profiling-and-screening', label: 'Service: Donor Profiling & Screening' },
  { type: 'page', ref: 'home', label: 'Page: Home' },
  { type: 'page', ref: 'about', label: 'Page: About Zizo' },
  { type: 'page', ref: 'how-it-works', label: 'Page: How It Works' },
  { type: 'page', ref: 'packages', label: 'Page: Zizo Packages' },
  { type: 'page', ref: 'international', label: 'Page: International Programs' },
  { type: 'page', ref: 'become-a-surrogate', label: 'Page: Become a Surrogate' },
  { type: 'page', ref: 'become-an-egg-donor', label: 'Page: Become an Egg Donor' },
  { type: 'page', ref: 'contact', label: 'Page: Contact Us' },
  { type: 'page', ref: 'faq', label: 'Page: Main FAQ Hub' },
];

export const FAQsPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'services' | 'pages' | 'unassigned'>('all');
  const [selectedPageFilter, setSelectedPageFilter] = useState<string>('all');

  // Drawer / modal states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [viewingFaq, setViewingFaq] = useState<FAQ | null>(null);
  const [question, setQuestion] = useState('');
  const [answerMd, setAnswerMd] = useState('');
  const [audience, setAudience] = useState<FAQ['audience']>('General');
  const [faqStatus, setFaqStatus] = useState<FAQ['status']>('published');
  const [assignedPages, setAssignedPages] = useState<string[]>([]);

  // Detach modal
  const [detachFaq, setDetachFaq] = useState<FAQ | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      if (res.ok) {
        const data = await res.json();
        const mapped: FAQ[] = (data.faqs || []).map((f: any) => ({
          id: f.id,
          question: f.question,
          answer_md: f.answer,
          audience: f.audience,
          status: f.published ? 'published' : 'draft',
          assignments: [],
          created_at: f.created_at || new Date().toISOString(),
          updated_at: f.updated_at || new Date().toISOString().split('T')[0],
        }));
        setFaqs(mapped);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      toast('Load Failed', 'Could not load FAQs from database.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    if (activeTab === 'services') {
      return (faq.assignments || []).some((a) => a.page_type === 'service');
    }
    if (activeTab === 'pages') {
      return (faq.assignments || []).some((a) => a.page_type === 'page');
    }
    if (activeTab === 'unassigned') {
      return (faq.assignments || []).length === 0;
    }
    if (selectedPageFilter !== 'all') {
      return (faq.assignments || []).some((a) => a.page_ref === selectedPageFilter);
    }
    return true;
  });

  const openCreate = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswerMd('');
    setAudience('General');
    setFaqStatus('published');
    setAssignedPages([]);
    setDrawerOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswerMd(faq.answer_md);
    setAudience(faq.audience);
    setFaqStatus(faq.status);
    setAssignedPages((faq.assignments || []).map((a) => a.page_ref));
    setDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      question,
      answer: answerMd,
      audience,
      show_on_home: 1,
      published: faqStatus === 'published' ? 1 : 0,
    };

    try {
      if (editingFaq) {
        const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update FAQ');
        toast('FAQ Updated', 'Saved FAQ details to database.', 'success');
      } else {
        const res = await fetch('/api/admin/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create FAQ');
        toast('FAQ Created', 'New FAQ added to registry.', 'success');
      }

      logAction({
        action: editingFaq ? 'EDIT_FAQ' : 'CREATE_FAQ',
        tableName: 'faqs',
        recordId: editingFaq?.id || 'new',
        diff: payload,
      });

      setDrawerOpen(false);
      fetchFaqs();
    } catch {
      toast('Save Failed', 'Could not save FAQ to database.', 'error');
    }
  };

  const handleDetachFromPage = (faqId: string, pageRef: string) => {
    setFaqs((prev) =>
      prev.map((f) => {
        if (f.id !== faqId) return f;
        return {
          ...f,
          assignments: (f.assignments || []).filter((a) => a.page_ref !== pageRef),
        };
      })
    );
    toast('Assignment Detached', `FAQ detached from page. The FAQ record was not deleted.`, 'info');
    setDetachFaq(null);
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;
    try {
      const res = await fetch(`/api/admin/faqs/${faqToDelete.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!res.ok) throw new Error('Failed to delete FAQ');
      toast('Deleted', `FAQ permanently deleted.`, 'info');
      logAction({
        action: 'DELETE_FAQ',
        tableName: 'faqs',
        recordId: faqToDelete.id,
      });
      fetchFaqs();
    } catch {
      toast('Delete Failed', 'Could not delete FAQ.', 'error');
    } finally {
      setFaqToDelete(null);
    }
  };

  const columns = React.useMemo<ColumnDef<FAQ>[]>(
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
      accessorKey: 'question',
      header: 'Question & Answer',
      cell: ({ row }) => {
        const faq = row.original;
        return (
          <div className="max-w-md">
            <p className="font-semibold text-sm text-[#17191A] truncate">{faq.question}</p>
            <p className="text-xs text-[#5D5E5F] truncate mt-0.5">{faq.answer_md}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'audience',
      header: 'Audience',
      cell: ({ row }) => <Badge variant="gray" size="sm">{row.original.audience}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
        const faq = row.original;
        return (
          <div className="text-right">
            <RowActionsMenu
              rowLabel={faq.question}
              items={[
                {
                  id: 'view',
                  label: 'View details',
                  onClick: () => setViewingFaq(faq),
                },
                {
                  id: 'edit',
                  label: 'Edit FAQ',
                  onClick: () => openEdit(faq),
                },
                {
                  id: 'detach',
                  label: 'Detach from page',
                  disabled: (faq.assignments || []).length === 0,
                  onClick: () => setDetachFaq(faq),
                },
                {
                  id: 'delete',
                  label: 'Delete permanently',
                  destructive: true,
                  dividerAbove: true,
                  onClick: () => setFaqToDelete(faq),
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
        title="FAQs &amp; Page Assignments"
        description="Centralized medical, legal, and operational questions attached across service cards and static pages."
        actions={
          <Button onClick={openCreate} iconLeading={<Plus className="w-4 h-4" />}>
            New FAQ
          </Button>
        }
      />

      {/* Tabs bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E0DD] pb-3">
        <div className="flex gap-4 text-sm font-medium">
          {(['all', 'services', 'pages', 'unassigned'] as const).map((tab) => (
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
              {tab === 'all' ? 'All FAQs' : tab === 'services' ? 'Services' : tab === 'pages' ? 'Site Pages' : 'Unassigned'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5D5E5F]">Filter Page:</span>
          <select
            value={selectedPageFilter}
            onChange={(e) => setSelectedPageFilter(e.target.value)}
            className="rounded border border-[#E1E0DD] bg-white px-2.5 py-1 text-xs text-[#17191A] focus:outline-none focus:ring-1 focus:ring-[#17645F]"
          >
            <option value="all">All pages</option>
            {AVAILABLE_PAGES.map((p) => (
              <option key={p.ref} value={p.ref}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={filteredFaqs}
        columns={columns}
        searchPlaceholder="Search questions or answers..."
        onRowClick={(row) => setViewingFaq(row)}
      />

      {/* Drawer for View Details */}
      <Drawer
        isOpen={Boolean(viewingFaq)}
        onClose={() => setViewingFaq(null)}
        title="FAQ Overview"
        description="Full answer content and assigned website touchpoints."
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewingFaq(null)}>
              Close
            </Button>
            {viewingFaq && (
              <Button
                variant="primary"
                onClick={() => {
                  const toEdit = viewingFaq;
                  setViewingFaq(null);
                  openEdit(toEdit);
                }}
              >
                Edit FAQ
              </Button>
            )}
          </>
        }
      >
        {viewingFaq && (
          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider block">
                Question
              </span>
              <h3 className="text-lg font-semibold text-[#17191A]">{viewingFaq.question}</h3>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="gray">{viewingFaq.audience}</Badge>
              <StatusBadge status={viewingFaq.status} />
              <span className="text-xs text-[#5D5E5F]">Updated: {viewingFaq.updated_at}</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider block">
                Answer Content
              </span>
              <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] text-sm text-[#2E3031] leading-relaxed whitespace-pre-wrap">
                {viewingFaq.answer_md}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-[#5D5E5F] uppercase tracking-wider block">
                Attached Pages ({(viewingFaq.assignments || []).length})
              </span>
              {(viewingFaq.assignments || []).length > 0 ? (
                <div className="space-y-2">
                  {viewingFaq.assignments?.map((a) => (
                    <div
                      key={a.page_ref}
                      className="p-3 rounded-[8px] border border-[#E1E0DD] bg-white flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#17191A]">{a.page_title || a.page_ref}</p>
                        <p className="text-xs font-mono text-[#5D5E5F]">Ref: {a.page_ref}</p>
                      </div>
                      <Badge variant="brand" size="sm">
                        {a.page_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#969594] italic">
                  Not attached to individual pages; visible only on the centralized FAQ Hub.
                </p>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Drawer for Create / Edit */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingFaq ? 'Edit FAQ' : 'New Clinical FAQ'}
        description="Write question and answer in Markdown, and select pages to display on."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save FAQ &amp; Sync
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Question"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How is surrogate compensation structured?"
          />

          <Textarea
            label="Answer (Markdown Supported)"
            required
            rows={5}
            value={answerMd}
            onChange={(e) => setAnswerMd(e.target.value)}
            placeholder="Clear, authoritative explanation..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Audience Group"
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              options={[
                { value: 'General', label: 'General' },
                { value: 'Intended Parents', label: 'Intended Parents' },
                { value: 'Surrogates', label: 'Surrogates' },
                { value: 'Donors', label: 'Donors' },
                { value: 'Legal and Costs', label: 'Legal & Costs' },
              ]}
            />

            <Select
              label="Status"
              value={faqStatus}
              onChange={(e) => setFaqStatus(e.target.value as any)}
              options={[
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-sm font-medium text-[#17191A]">
              Assign to Pages (Multi-Select)
            </label>
            <p className="text-xs text-[#5D5E5F]">
              Select which pages should render this FAQ in their accordion.
            </p>
            <div className="max-h-48 overflow-y-auto border border-[#E1E0DD] rounded-[8px] p-3 space-y-2 bg-white">
              {AVAILABLE_PAGES.map((page) => (
                <label key={page.ref} className="flex items-center gap-2 text-xs text-[#17191A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignedPages.includes(page.ref)}
                    onChange={(e) => {
                      if (e.target.checked) setAssignedPages((prev) => [...prev, page.ref]);
                      else setAssignedPages((prev) => prev.filter((p) => p !== page.ref));
                    }}
                    className="w-4 h-4 accent-[#17645F]"
                  />
                  <span>{page.label}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Drawer>

      {/* Detach Modal */}
      <Modal
        isOpen={Boolean(detachFaq)}
        onClose={() => setDetachFaq(null)}
        title="Detach FAQ from Pages"
        description="Select which page assignment to remove. The FAQ item will remain in the database."
      >
        {detachFaq && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[#17191A]">{detachFaq.question}</p>
            <div className="space-y-2 divide-y divide-[#E1E0DD] border border-[#E1E0DD] rounded-[8px] p-2">
              {(detachFaq.assignments || []).map((as) => (
                <div key={as.page_ref} className="flex items-center justify-between p-2 text-xs">
                  <span className="text-[#17191A]">{as.page_title || as.page_ref}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDetachFromPage(detachFaq.id, as.page_ref)}
                  >
                    Detach
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(faqToDelete)}
        onClose={() => setFaqToDelete(null)}
        onConfirm={handleDelete}
        title="Delete FAQ Permanently"
        description={`Are you sure you want to delete this FAQ? It will be removed from ${
          (faqToDelete?.assignments || []).length
        } assigned pages.`}
        confirmLabel="Delete FAQ"
      />
    </div>
  );
};
