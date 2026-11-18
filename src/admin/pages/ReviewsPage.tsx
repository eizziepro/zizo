import React, { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Badge } from '../components/untitledui/Badge';
import { Button } from '../components/untitledui/Button';
import { Drawer } from '../components/untitledui/Drawer';
import { Textarea } from '../components/untitledui/Textarea';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { Star01 } from '@untitledui/icons';
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
    body: 'Dr. Chizaram explained each medication cycle clearly. My privacy and confidentiality were completely respected throughout.',
    country: 'Nigeria',
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

  const columns: ColumnDef<Review>[] = [
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
          <div>
            <p className="font-semibold text-sm text-[#17191A]">{r.display_name}</p>
            <p className="text-xs text-[#5D5E5F]">{r.role} · {r.country || 'Global'}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="space-y-1">
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
          <div className="max-w-md">
            <p className="font-semibold text-xs text-[#17191A]">{r.title}</p>
            <p className="text-xs text-[#5D5E5F] line-clamp-1">{r.body}</p>
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
          <div className="space-y-1">
            <Badge variant={r.verified ? 'success' : 'gray'} size="sm">
              {r.verified ? 'Verified Invite' : r.source === 'legacy' ? 'Legacy Testimonial' : 'Public Web Form'}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Submitted',
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
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Reviews &amp; Client Feedback"
        description="Moderate anonymous parent stories, surrogate testimonials, and verified donor reflections."
        breadcrumbs={[{ label: 'Staff Portal', href: '/admin/' }, { label: 'Reviews' }]}
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
