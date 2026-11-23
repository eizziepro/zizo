import React, { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Avatar } from '../components/untitledui/Avatar';
import { Badge } from '../components/untitledui/Badge';
import { Button } from '../components/untitledui/Button';
import { Drawer } from '../components/untitledui/Drawer';
import { Modal } from '../components/untitledui/Modal';
import { Input } from '../components/untitledui/Input';
import { Select } from '../components/untitledui/Select';
import { Textarea } from '../components/untitledui/Textarea';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { Star01, Plus, Edit01 } from '@untitledui/icons';
import type { Review } from '../types';

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    display_name: 'Parent AJ',
    role: 'Intended Parent',
    rating: 5,
    title: 'Peace of mind across continents',
    body: 'The coordination between Lagos and our local clinic in London was seamless. Every legal contract and ultrasound milestone was shared promptly.',
    country: 'United Kingdom',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80',
    status: 'approved',
    featured: true,
    verified: true,
    source: 'token',
    created_at: '2026-11-05T10:00:00Z',
    approved_at: '2026-11-06T09:00:00Z',
  },
  {
    id: 'rev-2',
    display_name: 'B.O., Surrogate Mother',
    role: 'Surrogate',
    rating: 5,
    title: 'Treated with dignity and medical excellence',
    body: 'The coordinator accompanied me to every hospital visit. Housing allowances and post-birth nutrition were handled with immense care.',
    country: 'Nigeria',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=160&q=80',
    status: 'approved',
    featured: true,
    verified: true,
    source: 'legacy',
    created_at: '2026-10-20T12:00:00Z',
    approved_at: '2026-10-21T08:00:00Z',
  },
  {
    id: 'rev-3',
    display_name: 'Anonymous Donor',
    role: 'Egg Donor',
    rating: 5,
    title: 'Transparent compensation and gentle care',
    body: 'Chizaram explained each medication cycle clearly. My privacy and confidentiality were completely respected throughout.',
    country: 'Nigeria',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    status: 'pending',
    featured: false,
    verified: false,
    source: 'public',
    created_at: '2026-11-17T16:00:00Z',
  },
];

export const ReviewsPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'featured' | 'rejected'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  // Add Testimonial State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRole, setAddRole] = useState<Review['role']>('Intended Parent');
  const [addRating, setAddRating] = useState('5');
  const [addTitle, setAddTitle] = useState('');
  const [addBody, setAddBody] = useState('');
  const [addCountry, setAddCountry] = useState('Nigeria');
  const [addJourneyYear, setAddJourneyYear] = useState('2026');
  const [addSource, setAddSource] = useState<Review['source']>('legacy');
  const [addFeatured, setAddFeatured] = useState(true);
  const [addStatus, setAddStatus] = useState<Review['status']>('approved');

  // Edit Story State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Review['role']>('Intended Parent');
  const [editRating, setEditRating] = useState('5');
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editJourneyYear, setEditJourneyYear] = useState('2026');
  const [editFeatured, setEditFeatured] = useState(false);

  const handleOpenEditModal = (r: Review) => {
    setEditingReview(r);
    setEditName(r.display_name);
    setEditRole(r.role);
    setEditRating(String(r.rating));
    setEditTitle(r.title);
    setEditBody(r.body);
    setEditCountry(r.country || '');
    setEditJourneyYear(r.journey_year ? String(r.journey_year) : '2026');
    setEditFeatured(r.featured);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    const updated: Review = {
      ...editingReview,
      display_name: editName.trim() || editingReview.display_name,
      role: editRole,
      rating: Number(editRating) || 5,
      title: editTitle.trim() || editingReview.title,
      body: editBody.trim() || editingReview.body,
      country: editCountry.trim() || null,
      journey_year: Number(editJourneyYear) || null,
      featured: editFeatured,
    };

    setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? updated : r)));
    if (selectedReview?.id === editingReview.id) setSelectedReview(updated);
    setIsEditModalOpen(false);
    toast('Story Updated', 'Testimonial details updated successfully.', 'success');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addTitle.trim() || !addBody.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      display_name: addName.trim(),
      role: addRole,
      rating: Number(addRating) || 5,
      title: addTitle.trim(),
      body: addBody.trim(),
      country: addCountry.trim() || null,
      journey_year: Number(addJourneyYear) || 2026,
      status: addStatus,
      featured: addFeatured,
      verified: addSource === 'token',
      source: addSource,
      created_at: new Date().toISOString(),
      approved_at: addStatus === 'approved' ? new Date().toISOString() : null,
    };

    setReviews((prev) => [newRev, ...prev]);
    logAction({
      action: 'ADD_TESTIMONIAL',
      tableName: 'reviews',
      recordId: newRev.id,
      diff: { name: newRev.display_name, role: newRev.role },
    });
    toast('Testimonial Added', `Story for ${newRev.display_name} recorded.`, 'success');
    setIsAddModalOpen(false);
    setAddName('');
    setAddTitle('');
    setAddBody('');
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    if (activeTab === 'approved' && r.status !== 'approved') return false;
    if (activeTab === 'featured' && !r.featured) return false;
    if (activeTab === 'rejected' && r.status !== 'rejected') return false;
    if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
    return true;
  });

  const handleStatusChange = (id: string, status: Review['status']) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, approved_at: status === 'approved' ? new Date().toISOString() : r.approved_at } : r))
    );
    setSelectedReview(null);
    logAction({
      action: 'UPDATE_REVIEW_STATUS',
      tableName: 'reviews',
      recordId: id,
      diff: { status },
    });
    toast('Review Moderated', `Status updated to ${status}.`, 'success');
  };

  const handleToggleFeatured = (id: string, current: boolean) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, featured: !current } : r))
    );
    toast('Featured Updated', 'Homepage showcase status updated.', 'info');
  };

  const handleDelete = () => {
    if (!reviewToDelete) return;
    setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
    logAction({
      action: 'DELETE_REVIEW',
      tableName: 'reviews',
      recordId: reviewToDelete.id,
    });
    toast('Review Deleted', 'Review removed permanently.', 'info');
    setReviewToDelete(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star01
            key={i}
            className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-500' : 'text-[#E1E0DD]'}`}
          />
        ))}
      </div>
    );
  };

  const columns = React.useMemo<ColumnDef<Review>[]>(
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
      accessorKey: 'display_name',
      header: 'Reviewer',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-[150px]">
            <Avatar src={r.avatar_url} name={r.display_name} size="sm" />
            <div className="truncate max-w-[160px]">
              <p className="font-semibold text-sm text-[#17191A] truncate">{r.display_name}</p>
              <p className="text-xs text-[#5D5E5F] truncate">{r.role} · {r.country || 'Global'}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="space-y-0.5 whitespace-nowrap">
          {renderStars(row.original.rating)}
          <span className="text-[11px] font-mono text-[#5D5E5F]">{row.original.rating} / 5.0</span>
        </div>
      ),
    },
    {
      accessorKey: 'body',
      header: 'Review Story Excerpt',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="max-w-xs">
            <p className="font-semibold text-xs text-[#17191A] truncate">{r.title}</p>
            <p className="text-xs text-[#5D5E5F] truncate">{r.body}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'verified',
      header: 'Source',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <Badge variant={r.verified ? 'success' : 'gray'} size="sm">
            {r.verified ? 'Verified' : r.source === 'legacy' ? 'Legacy' : 'Public'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Submitted',
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
        const r = row.original;
        return (
          <div className="text-right">
            <RowActionsMenu
              rowLabel={`review by ${r.display_name}`}
              items={[
                {
                  id: 'view',
                  label: 'View & moderate',
                  onClick: () => {
                    setSelectedReview(r);
                    setReplyText(r.admin_reply || '');
                  },
                },
                {
                  id: 'edit',
                  label: 'Edit story',
                  onClick: () => handleOpenEditModal(r),
                },
                {
                  id: 'approve',
                  label: 'Approve story',
                  onClick: () => handleStatusChange(r.id, 'approved'),
                },
                {
                  id: 'feature',
                  label: r.featured ? 'Unfeature' : 'Feature on Homepage',
                  onClick: () => handleToggleFeatured(r.id, r.featured),
                },
                {
                  id: 'reject',
                  label: 'Reject',
                  onClick: () => handleStatusChange(r.id, 'rejected'),
                },
                {
                  id: 'delete',
                  label: 'Delete review',
                  destructive: true,
                  dividerAbove: true,
                  onClick: () => setReviewToDelete(r),
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
        title="Reviews &amp; Client Feedback"
        description="Moderate anonymous parent stories, surrogate testimonials, and verified donor reflections."
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            iconLeading={<Plus className="w-4 h-4" />}
          >
            Add Testimonial
          </Button>
        }
      />

      {/* Tabs bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E0DD] pb-3">
        <div className="flex gap-4 text-sm font-medium">
          {(['all', 'pending', 'approved', 'featured', 'rejected'] as const).map((tab) => (
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
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5D5E5F]">Source:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded border border-[#E1E0DD] bg-white px-2.5 py-1 text-xs text-[#17191A] focus:outline-none focus:ring-1 focus:ring-[#17645F]"
          >
            <option value="all">All sources</option>
            <option value="token">Verified invite</option>
            <option value="public">Website form</option>
            <option value="legacy">Legacy testimonial</option>
          </select>
        </div>
      </div>

      <DataTable
        data={filteredReviews}
        columns={columns}
        searchPlaceholder="Search reviews by title, reviewer..."
        onRowClick={(row) => {
          setSelectedReview(row);
          setReplyText(row.admin_reply || '');
        }}
      />

      {/* Moderation Drawer */}
      <Drawer
        isOpen={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        title="Review Moderation"
        description={`Story submitted under ${selectedReview?.display_name}`}
      >
        {selectedReview && (
          <div className="space-y-6">
            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Moderation Status</span>
                <StatusBadge status={selectedReview.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Rating</span>
                {renderStars(selectedReview.rating)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5D5E5F]">Role &amp; Country</span>
                <span className="text-xs font-semibold text-[#17191A]">
                  {selectedReview.role} ({selectedReview.country || 'Global'})
                </span>
              </div>
            </div>

            {selectedReview.source === 'legacy' && (
              <div className="p-3 rounded-[8px] bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <strong>Legacy Testimonial:</strong> Confirm permission before publishing on live pages.
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Full Feedback Narrative
              </h4>
              <div className="p-4 rounded-[8px] border border-[#E1E0DD] bg-white space-y-2 text-xs">
                <h5 className="font-semibold text-sm text-[#17191A]">{selectedReview.title}</h5>
                <p className="text-[#2E3031] leading-relaxed">{selectedReview.body}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
                Public Coordinator Reply
              </h4>
              <p className="text-xs text-[#5D5E5F]">
                Optional reply published alongside the review on the public testimonials page.
              </p>
              <Textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank you for sharing your journey with Zizo..."
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setReviews((prev) =>
                    prev.map((r) => (r.id === selectedReview.id ? { ...r, admin_reply: replyText } : r))
                  );
                  toast('Reply Saved', 'Public coordinator reply saved.', 'info');
                }}
              >
                Save Reply
              </Button>
            </div>

            <div className="pt-4 border-t border-[#E1E0DD] flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleOpenEditModal(selectedReview)}
              >
                Edit Story Details
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleStatusChange(selectedReview.id, 'approved');
                  setSelectedReview(null);
                }}
              >
                Approve Story
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  handleStatusChange(selectedReview.id, 'rejected');
                  setSelectedReview(null);
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Testimonial Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="2xl"
        title="Add Client Testimonial"
        description="Record a testimonial or reflection from an intended parent, surrogate, or egg donor."
      >
        <form onSubmit={handleAddReview} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Author Display Name"
              required
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="e.g. Parent D. &amp; M."
            />
            <Select
              label="Role"
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as any)}
              options={[
                { value: 'Intended Parent', label: 'Intended Parent' },
                { value: 'Surrogate', label: 'Surrogate Mother' },
                { value: 'Egg Donor', label: 'Egg Donor' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Rating (1 - 5 Stars)"
              value={addRating}
              onChange={(e) => setAddRating(e.target.value)}
              options={[
                { value: '5', label: '★★★★★ (5 Stars)' },
                { value: '4', label: '★★★★☆ (4 Stars)' },
                { value: '3', label: '★★★☆☆ (3 Stars)' },
              ]}
            />
            <Input
              label="Country of Residence"
              value={addCountry}
              onChange={(e) => setAddCountry(e.target.value)}
              placeholder="Nigeria"
            />
            <Input
              label="Journey Year"
              type="number"
              value={addJourneyYear}
              onChange={(e) => setAddJourneyYear(e.target.value)}
              placeholder="2026"
            />
          </div>

          <Input
            label="Story Title"
            required
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            placeholder="e.g. Beyond grateful for our twins through Zizo"
          />

          <Textarea
            label="Full Testimonial Story"
            required
            rows={4}
            value={addBody}
            onChange={(e) => setAddBody(e.target.value)}
            placeholder="Share personal reflections and coordinator experience..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Select
              label="Source Channel"
              value={addSource}
              onChange={(e) => setAddSource(e.target.value as any)}
              options={[
                { value: 'legacy', label: 'Legacy / Manual entry' },
                { value: 'token', label: 'Verified consultation token' },
                { value: 'public', label: 'Public web form' },
              ]}
            />
            <Select
              label="Moderation Status"
              value={addStatus}
              onChange={(e) => setAddStatus(e.target.value as any)}
              options={[
                { value: 'approved', label: 'Approved (Publish immediately)' },
                { value: 'pending', label: 'Pending Review' },
              ]}
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-[#17191A] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={addFeatured}
              onChange={(e) => setAddFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#17645F]"
            />
            <span>Feature prominently in homepage testimonial highlights</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E0DD]">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Testimonial
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Story Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="2xl"
        title="Edit Testimonial Story"
        description="Update story content, display name, or publishing preferences."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Author Display Name"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Select
              label="Role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as any)}
              options={[
                { value: 'Intended Parent', label: 'Intended Parent' },
                { value: 'Surrogate', label: 'Surrogate Mother' },
                { value: 'Egg Donor', label: 'Egg Donor' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Rating"
              value={editRating}
              onChange={(e) => setEditRating(e.target.value)}
              options={[
                { value: '5', label: '★★★★★ (5 Stars)' },
                { value: '4', label: '★★★★☆ (4 Stars)' },
                { value: '3', label: '★★★☆☆ (3 Stars)' },
              ]}
            />
            <Input
              label="Country"
              value={editCountry}
              onChange={(e) => setEditCountry(e.target.value)}
            />
            <Input
              label="Journey Year"
              type="number"
              value={editJourneyYear}
              onChange={(e) => setEditJourneyYear(e.target.value)}
            />
          </div>

          <Input
            label="Story Title"
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <Textarea
            label="Testimonial Story"
            required
            rows={4}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
          />

          <label className="flex items-center gap-2 text-xs text-[#17191A] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={editFeatured}
              onChange={(e) => setEditFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#17645F]"
            />
            <span>Feature on Homepage Testimonials Showcase</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E0DD]">
            <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        description={`Are you sure you want to permanently delete the review by ${reviewToDelete?.display_name}?`}
        confirmLabel="Delete Review"
      />
    </div>
  );
};
