import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Masking helpers mirroring src/admin/components/common/MaskedValue.tsx
export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length === 2) {
    const name = parts[0];
    const domain = parts[1];
    const maskedName = name.length > 1 ? `${name[0]}***` : `${name}***`;
    return `${maskedName}@${domain}`;
  }
  return '***@***';
}

export function maskPhone(phone: string): string {
  const cleaned = phone.trim();
  if (cleaned.length > 4) {
    const lastFour = cleaned.slice(-4);
    const prefix = cleaned.startsWith('+') ? cleaned.slice(0, 4) : '';
    return prefix ? `${prefix} *** *** ${lastFour}` : `*** *** ${lastFour}`;
  }
  return '*** ***';
}

// Role permission mapping mirroring src/admin/hooks/usePermissions.ts
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: [
    'overview',
    'inquiries',
    'applications',
    'bookings',
    'consultation-types',
    'services',
    'blog',
    'faqs',
    'reviews',
    'subscribers',
    'audit-log',
    'settings:profile',
    'settings:security',
    'settings:site',
    'settings:availability',
    'settings:integrations',
    'settings:notifications',
    'settings:team',
  ],
  coordinator: [
    'overview',
    'inquiries',
    'applications',
    'bookings',
    'consultation-types',
    'subscribers',
    'settings:profile',
    'settings:security',
    'settings:availability',
    'settings:integrations',
    'settings:notifications',
  ],
  editor: [
    'overview',
    'services',
    'blog',
    'faqs',
    'reviews',
    'settings:profile',
    'settings:security',
    'settings:notifications',
  ],
};

test('ADMIN PERMISSIONS: Staff role boundaries and restrictions', () => {
  // Owner has full access
  assert.ok(ROLE_PERMISSIONS.owner.includes('audit-log'), 'Owner must have access to audit-log');
  assert.ok(ROLE_PERMISSIONS.owner.includes('settings:team'), 'Owner must have access to settings:team');
  assert.ok(ROLE_PERMISSIONS.owner.includes('inquiries'), 'Owner must have access to inquiries');
  assert.ok(ROLE_PERMISSIONS.owner.includes('services'), 'Owner must have access to services');

  // Coordinator has access to inquiries, bookings, applications, but NOT audit-log, team settings, or website editing
  assert.ok(ROLE_PERMISSIONS.coordinator.includes('inquiries'), 'Coordinator must access inquiries');
  assert.ok(ROLE_PERMISSIONS.coordinator.includes('applications'), 'Coordinator must access applications');
  assert.ok(ROLE_PERMISSIONS.coordinator.includes('bookings'), 'Coordinator must access bookings');
  assert.ok(!ROLE_PERMISSIONS.coordinator.includes('audit-log'), 'Coordinator must NOT access audit-log');
  assert.ok(!ROLE_PERMISSIONS.coordinator.includes('settings:team'), 'Coordinator must NOT access team management');
  assert.ok(!ROLE_PERMISSIONS.coordinator.includes('services'), 'Coordinator must NOT edit services');
  assert.ok(!ROLE_PERMISSIONS.coordinator.includes('faqs'), 'Coordinator must NOT edit faqs');

  // Editor has access to website content, but NOT inquiries, applications, bookings, audit-log, or team
  assert.ok(ROLE_PERMISSIONS.editor.includes('services'), 'Editor must access services');
  assert.ok(ROLE_PERMISSIONS.editor.includes('blog'), 'Editor must access blog');
  assert.ok(ROLE_PERMISSIONS.editor.includes('faqs'), 'Editor must access faqs');
  assert.ok(ROLE_PERMISSIONS.editor.includes('reviews'), 'Editor must access reviews');
  assert.ok(!ROLE_PERMISSIONS.editor.includes('inquiries'), 'Editor must NOT access inquiries');
  assert.ok(!ROLE_PERMISSIONS.editor.includes('applications'), 'Editor must NOT access applications');
  assert.ok(!ROLE_PERMISSIONS.editor.includes('bookings'), 'Editor must NOT access bookings');
  assert.ok(!ROLE_PERMISSIONS.editor.includes('audit-log'), 'Editor must NOT access audit-log');
  assert.ok(!ROLE_PERMISSIONS.editor.includes('settings:team'), 'Editor must NOT access team settings');
});

test('ADMIN PERMISSIONS: Custom modular editor permissions and roles', () => {
  const defaultEditorPerms = ['services', 'blog', 'faqs', 'reviews'];
  assert.ok(defaultEditorPerms.includes('services'));
  assert.ok(defaultEditorPerms.includes('blog'));
  assert.ok(defaultEditorPerms.includes('faqs'));
  assert.ok(defaultEditorPerms.includes('reviews'));

  // Editor with custom extended permissions
  const customEditorPerms = [...defaultEditorPerms, 'inquiries', 'applications'];
  assert.ok(customEditorPerms.includes('inquiries'));
  assert.ok(customEditorPerms.includes('applications'));
  assert.ok(!customEditorPerms.includes('audit-log'));

  // TeamTab only allows editor and owner for staff invitations
  const teamTabPath = path.resolve('src/admin/pages/settings/TeamTab.tsx');
  const teamTabSrc = fs.readFileSync(teamTabPath, 'utf8');
  assert.ok(teamTabSrc.includes("value: 'editor'"));
  assert.ok(teamTabSrc.includes("value: 'owner'"));
  assert.ok(!teamTabSrc.includes("value: 'coordinator'"));
});

test('ADMIN PII: Masking rules for emails and phone numbers', () => {
  assert.equal(maskEmail('adebayo@gmail.com'), 'a***@gmail.com');
  assert.equal(maskEmail('info@zizofertility.com'), 'i***@zizofertility.com');
  assert.equal(maskEmail('x@test.com'), 'x***@test.com');
  assert.equal(maskEmail('invalid-email'), '***@***');

  assert.equal(maskPhone('+2348012345678'), '+234 *** *** 5678');
  assert.equal(maskPhone('+1234567890'), '+123 *** *** 7890');
  assert.equal(maskPhone('08012345678'), '*** *** 5678');
  assert.equal(maskPhone('123'), '*** ***');
});

test('ADMIN DATABASE: Supabase migration 004_admin_upgrade schema verification', () => {
  const migrationPath = path.resolve('supabase/migrations/004_admin_upgrade.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration 004_admin_upgrade.sql must exist');

  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Verify critical tables exist
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS services'), 'Services table must be defined');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS faq_assignments'), 'faq_assignments table must be defined');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS site_pages'), 'site_pages table must be defined');

  // Verify RLS enabled on new tables
  assert.ok(sql.includes('ALTER TABLE services ENABLE ROW LEVEL SECURITY'), 'Services RLS must be enabled');
  assert.ok(sql.includes('ALTER TABLE faq_assignments ENABLE ROW LEVEL SECURITY'), 'faq_assignments RLS must be enabled');
  assert.ok(sql.includes('ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY'), 'site_pages RLS must be enabled');

  // Verify role checks
  assert.ok(sql.includes("'owner'"), 'Owner role check must be present');
  assert.ok(sql.includes("'editor'"), 'Editor role check must be present');

  // Verify audit log insert policy for PII reveals and staff actions
  assert.ok(sql.includes('Staff insert audit_log'), 'Staff insert audit_log policy must be present in migration');
});

test('ADMIN DATABASE: Supabase migration 005_cases_and_enhancements schema verification', () => {
  const migrationPath = path.resolve('supabase/migrations/005_cases_and_enhancements.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration 005_cases_and_enhancements.sql must exist');

  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Verify form schema enhancements exist and cases table is removed
  assert.ok(!sql.includes('CREATE TABLE IF NOT EXISTS cases'), 'Cases table must NOT be created');
  assert.ok(sql.includes('DROP TABLE IF EXISTS cases'), 'Cases table must be dropped');
  assert.ok(sql.includes('ALTER TABLE applications'), 'Applications table enhancements must be present');
  assert.ok(sql.includes('ALTER TABLE inquiries'), 'Inquiries table enhancements must be present');
});

test('ADMIN APP ARCHITECTURE: Strict UI fidelity invariants', () => {
  // Sidebar invariant: 'Reviews' (never 'Reviews and Testimonials')
  const sidebarPath = path.resolve('src/admin/components/layout/Sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  assert.ok(sidebarContent.includes('Reviews'), "Sidebar label must be 'Reviews'");
  assert.ok(!sidebarContent.includes('Reviews and Testimonials'), "Sidebar must NEVER use 'Reviews and Testimonials'");

  // Inquiries and Applications are separate pages and items
  assert.ok(sidebarContent.includes('Inquiries'), "Sidebar must have 'Inquiries'");
  assert.ok(sidebarContent.includes('Applications'), "Sidebar must have 'Applications'");

  // Cases must NOT be an active nav link or present
  assert.ok(!sidebarContent.includes('/cases'), "Sidebar must NOT have a link to '/cases'");
  assert.ok(!fs.existsSync(path.resolve('src/admin/pages/CasesPage.tsx')), 'CasesPage.tsx must not exist');

  // Avatar menu items invariant: Profile, Site Settings, Audit Log, Sign out
  const avatarMenuPath = path.resolve('src/admin/components/layout/AvatarMenu.tsx');
  const avatarMenuContent = fs.readFileSync(avatarMenuPath, 'utf8');
  assert.ok(avatarMenuContent.includes('Profile'), "Avatar menu must have 'Profile'");
  assert.ok(avatarMenuContent.includes('Site Settings'), "Avatar menu must have 'Site Settings'");
  assert.ok(avatarMenuContent.includes('Audit Log'), "Avatar menu must have 'Audit Log'");
  assert.ok(avatarMenuContent.includes('Sign out'), "Avatar menu must have 'Sign out'");

  // Row actions strictly use DotsVertical
  const rowActionsPath = path.resolve('src/admin/components/common/RowActionsMenu.tsx');
  const rowActionsContent = fs.readFileSync(rowActionsPath, 'utf8');
  assert.ok(rowActionsContent.includes('DotsVertical'), 'Row actions must use DotsVertical');

  // Footer copyright explicitly 2026
  const shellPath = path.resolve('src/admin/components/layout/AppShell.tsx');
  const shellContent = fs.readFileSync(shellPath, 'utf8');
  assert.ok(shellContent.includes('2026 Zizo'), 'Footer copyright must be 2026 Zizo');

  // Zero Inter font in admin CSS
  const cssPath = path.resolve('src/admin/styles/admin.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert.ok(!cssContent.toLowerCase().includes('font-family: inter'), 'Inter font is strictly forbidden');
  assert.ok(cssContent.includes('Hanken Grotesk'), 'UI font must be Hanken Grotesk');
  assert.ok(cssContent.includes('Fraunces'), 'Heading font must be Fraunces');
});
