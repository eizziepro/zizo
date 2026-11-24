import React, { useState, useEffect, useCallback } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../components/untitledui/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { Badge } from '../components/untitledui/Badge';
import { Button } from '../components/untitledui/Button';
import { Drawer } from '../components/untitledui/Drawer';
import { Input } from '../components/untitledui/Input';
import { Textarea } from '../components/untitledui/Textarea';
import { Select } from '../components/untitledui/Select';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ImageUpload } from '../components/untitledui/ImageUpload';
import { WysiwygEditor } from '../components/untitledui/WysiwygEditor';
import { useNotifications } from '../context/NotificationContext';
import { useAuditLog } from '../hooks/useAuditLog';
import { Plus, BookOpen01 } from '@untitledui/icons';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body_md: string;
  category: string;
  author: string;
  featured_image?: string | null;
  image_alt?: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publish_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  updated_at: string;
}

export const BlogPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'scheduled' | 'drafts' | 'archived'>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/posts');
      if (res.ok) {
        const data = await res.json();
        const mapped: BlogPost[] = (data.posts || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || '',
          body_md: p.body_md || '',
          category: p.category_name || 'Clinical Care',
          author: p.author_name || 'Chizaram Ata',
          featured_image: p.featured_image_url,
          image_alt: p.featured_image_alt,
          status: p.status,
          publish_at: p.publish_at,
          seo_title: p.seo_title,
          seo_description: p.meta_description,
          updated_at: (p.updated_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
        }));
        setPosts(mapped);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
      toast('Load Failed', 'Could not load blog posts from database.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Editor states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [category, setCategory] = useState('Clinical Care');
  const [author, setAuthor] = useState('Chizaram Ata');
  const [status, setStatus] = useState<BlogPost['status']>('published');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Delete modal
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'drafts') return p.status === 'draft';
    return p.status === activeTab;
  });

  const openCreate = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setBodyMd('');
    setCategory('Clinical Care');
    setAuthor('Chizaram Ata');
    setFeaturedImage(null);
    setImageAlt('');
    setPublishAt('');
    setSeoTitle('');
    setSeoDescription('');
    setStatus('published');
    setEditorOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditingPost(p);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt);
    setBodyMd(p.body_md);
    setCategory(p.category);
    setAuthor(p.author);
    setFeaturedImage(p.featured_image || null);
    setImageAlt(p.image_alt || '');
    setPublishAt(p.publish_at ? p.publish_at.slice(0, 16) : '');
    setSeoTitle(p.seo_title || '');
    setSeoDescription(p.seo_description || '');
    setStatus(p.status);
    setEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      excerpt,
      body_md: bodyMd,
      featured_image_url: featuredImage,
      featured_image_alt: imageAlt.trim() || null,
      status,
      publish_at: status === 'scheduled' ? (publishAt ? new Date(publishAt).toISOString() : new Date().toISOString()) : status === 'published' ? new Date().toISOString() : null,
      seo_title: seoTitle.trim() || null,
      meta_description: seoDescription.trim() || null,
    };

    try {
      if (editingPost) {
        const res = await fetch(`/api/admin/posts/${editingPost.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update post');
        toast('Post Updated', `Saved changes to "${title}".`, 'success');
      } else {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create post');
        toast('Post Created', `Created "${title}".`, 'success');
      }

      logAction({
        action: editingPost ? 'EDIT_POST' : 'CREATE_POST',
        tableName: 'posts',
        recordId: editingPost?.id || 'new',
        diff: payload,
      });

      setEditorOpen(false);
      fetchPosts();
    } catch {
      toast('Save Failed', 'Could not save post to database.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      const res = await fetch(`/api/admin/posts/${postToDelete.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!res.ok) throw new Error('Failed to delete post');
      toast('Post Deleted', `Deleted "${postToDelete.title}".`, 'info');
      logAction({
        action: 'DELETE_POST',
        tableName: 'posts',
        recordId: postToDelete.id,
      });
      fetchPosts();
    } catch {
      toast('Delete Failed', 'Could not delete post.', 'error');
    } finally {
      setPostToDelete(null);
    }
  };

  const columns = React.useMemo<ColumnDef<BlogPost>[]>(
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
      header: 'Post',
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[160px]">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2ECEB] text-[#17645F] flex items-center justify-center shrink-0">
              <BookOpen01 className="w-4 h-4" />
            </div>
            <div className="truncate max-w-[200px]">
              <p className="font-semibold text-sm text-[#17191A] truncate">{p.title}</p>
              <p className="text-xs font-mono text-[#5D5E5F] truncate">/{p.slug}/</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="gray" size="sm">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => <span className="text-xs text-[#5D5E5F] whitespace-nowrap">{row.original.author}</span>,
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
        const p = row.original;
        return (
          <div className="text-right">
            <RowActionsMenu
              rowLabel={p.title}
              items={[
                {
                  id: 'edit',
                  label: 'Edit post',
                  onClick: () => openEdit(p),
                },
                {
                  id: 'preview',
                  label: 'Preview on website',
                  onClick: () => window.open(`/resources/blog/${p.slug}/`, '_blank'),
                },
                {
                  id: 'unpublish',
                  label: p.status === 'published' ? 'Unpublish to draft' : 'Publish live',
                  onClick: () => {
                    const next = p.status === 'published' ? 'draft' : 'published';
                    setPosts((prev) => prev.map((item) => (item.id === p.id ? { ...item, status: next } : item)));
                    toast('Status Updated', `Post status set to ${next}.`, 'info');
                  },
                },
                {
                  id: 'delete',
                  label: 'Delete post',
                  destructive: true,
                  dividerAbove: true,
                  onClick: () => setPostToDelete(p),
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
        title="Blog &amp; Clinical Insights"
        description="Publish educational articles, legal guidance, and medical fertility insights."
        actions={
          <Button onClick={openCreate} iconLeading={<Plus className="w-4 h-4" />}>
            Draft New Article
          </Button>
        }
      />

      {/* Tabs */}
      <div className="border-b border-[#E1E0DD] flex gap-4 text-sm font-medium">
        {(['all', 'published', 'scheduled', 'drafts', 'archived'] as const).map((tab) => (
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

      <DataTable
        data={filteredPosts}
        columns={columns}
        searchPlaceholder="Search blog posts by title or category..."
        onRowClick={(row) => openEdit(row)}
      />

      {/* Full-Page Tabbed Drawer Editor */}
      <Drawer
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        width="2xl"
        title={editingPost ? 'Edit Blog Article' : 'Draft New Article'}
        description="Rich markdown writing with SEO fields and automatic sitemap synchronization."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save &amp; Publish Post
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ImageUpload
            label="Featured Cover Image"
            helperText="Click to upload or drag image. Automatically converted to WebP format."
            value={featuredImage}
            onChange={setFeaturedImage}
          />

          <Input
            label="Cover Image Alt Text (Accessibility &amp; SEO)"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Descriptive alt text for the featured cover..."
          />

          <Input
            label="Article Title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!editingPost) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
              }
            }}
            placeholder="e.g. Navigating Cross-Border Surrogacy Contracts in West Africa"
          />

          <Input
            label="URL Slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <Textarea
            label="Article Excerpt (Summary for Cards)"
            required
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short, compelling summary of the article..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Clinical Care', label: 'Clinical Care' },
                { value: 'Legal & Ethics', label: 'Legal & Ethics' },
                { value: 'Surrogacy Journey', label: 'Surrogacy Journey' },
                { value: 'Donor Care', label: 'Donor Care' },
              ]}
            />
            <Select
              label="Author Byline"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              options={[
                { value: 'Chizaram Ata', label: 'Chizaram Ata' },
                { value: 'Amara Okafor', label: 'Amara Okafor' },
                { value: 'Tunde Bakare', label: 'Tunde Bakare' },
              ]}
            />
          </div>

          <WysiwygEditor
            label="Article Body (WYSIWYG)"
            value={bodyMd}
            onChange={setBodyMd}
            minHeight="240px"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Publication Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'published', label: 'Published (Live)' },
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            {status === 'scheduled' ? (
              <Input
                label="Scheduled Publication Time (WAT)"
                type="datetime-local"
                required
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
              />
            ) : (
              <div className="flex items-center text-xs text-[#5D5E5F] pt-6">
                <span>Article will be updated immediately upon saving.</span>
              </div>
            )}
          </div>

          {/* SEO Metadata Section */}
          <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#17645F] uppercase tracking-wider">
                Search Engine Optimization (SEO)
              </h4>
              <span className="text-[11px] text-[#5D5E5F]">SERP Meta Tags</span>
            </div>
            <Input
              label="SEO Meta Title (Recommended: 50 - 60 chars)"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || 'Custom meta title...'}
            />
            <Textarea
              label="SEO Meta Description (Recommended: 150 - 160 chars)"
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={excerpt || 'Brief search snippet describing this fertility resource...'}
            />
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        isOpen={Boolean(postToDelete)}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${postToDelete?.title}"?`}
        confirmLabel="Delete Post"
      />
    </div>
  );
};
