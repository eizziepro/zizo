import React, { useState } from 'react';
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
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publish_at?: string | null;
  updated_at: string;
}

const INITIAL_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Navigating Cross-Border Surrogacy Contracts in West Africa',
    slug: 'navigating-cross-border-surrogacy-contracts',
    excerpt: 'Key legal covenants, parentage declarations, and international travel logistics for intended parents.',
    body_md: '<h2>Cross-Border Surrogacy Frameworks</h2><p>Legal planning is foundational when coordinating surrogacy between Nigeria, the UK, Europe, and the US...</p>',
    category: 'Legal & Ethics',
    author: 'Chizaram Ata',
    featured_image: '/assets/img/blog-default-1024w.webp',
    status: 'published',
    publish_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-15',
  },
  {
    id: 'post-2',
    title: 'Understanding Ovum Donor Screening Protocols',
    slug: 'understanding-ovum-donor-screening-protocols',
    excerpt: 'Why thorough phenotypic and genetic evaluation protects maternal and infant outcomes.',
    body_md: '<h2>Clinical Donor Screening</h2><p>Before any cycle begins, comprehensive blood panels, AMH tests, and genetic karyotyping are executed...</p>',
    category: 'Clinical Care',
    author: 'Amara Okafor',
    featured_image: '/assets/img/service-ovum-donation-1024w.webp',
    status: 'published',
    publish_at: '2026-02-10T12:00:00Z',
    updated_at: '2026-02-16',
  },
  {
    id: 'post-3',
    title: 'Preparing for Your First Gestational Transfer',
    slug: 'preparing-for-your-first-gestational-transfer',
    excerpt: 'Step-by-step guidance for surrogates and parents approaching embryo transfer day.',
    body_md: '<h2>Transfer Preparation Steps</h2><p>Endometrial preparation, hormonal synchronization, and emotional groundedness...</p>',
    category: 'Surrogacy Journey',
    author: 'Tunde Bakare',
    featured_image: '/assets/img/service-surrogacy-1024w.webp',
    status: 'draft',
    updated_at: '2026-02-17',
  },
];

export const BlogPage: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'scheduled' | 'drafts' | 'archived'>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Editor states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [category, setCategory] = useState('Clinical Care');
  const [author, setAuthor] = useState('Chizaram Ata');
  const [status, setStatus] = useState<BlogPost['status']>('published');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

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
    setStatus(p.status);
    setEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData: BlogPost = {
      id: editingPost ? editingPost.id : 'post-' + Date.now(),
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      excerpt,
      body_md: bodyMd,
      category,
      author,
      featured_image: featuredImage,
      status,
      publish_at: status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString().split('T')[0],
    };

    if (editingPost) {
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? itemData : p)));
      toast('Post Updated', `Saved changes to "${title}". Deploy hook triggered.`, 'success');
    } else {
      setPosts((prev) => [...prev, itemData]);
      toast('Post Created', `Created "${title}". Deploy hook triggered.`, 'success');
    }

    logAction({
      action: editingPost ? 'EDIT_POST' : 'CREATE_POST',
      tableName: 'posts',
      recordId: itemData.id,
      diff: itemData,
    });

    setEditorOpen(false);
  };

  const handleDelete = () => {
    if (!postToDelete) return;
    setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    logAction({
      action: 'DELETE_POST',
      tableName: 'posts',
      recordId: postToDelete.id,
    });
    toast('Post Deleted', `Deleted "${postToDelete.title}".`, 'info');
    setPostToDelete(null);
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

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
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
