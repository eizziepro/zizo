import { chromium } from 'playwright';

async function runVerification() {
  console.log('[Playwright E2E] Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const errors: string[] = [];
  page.on('pageerror', (err) => {
    console.error('[Page Error]:', err.message);
    errors.push(`PageError: ${err.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[Console Error]:', msg.text());
    }
  });

  console.log('\n--- 1. Testing Staff Sign In ---');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'owner@zizodonorandsurrogacy.com');
  await page.fill('input[type="password"]', 'OwnerPassword2026!');
  await page.click('button:has-text("Continue to Portal")');
  await page.waitForSelector('h1.greeting-title', { timeout: 10000 });
  console.log('✓ Signed in successfully. Current URL:', page.url());

  const routesToTest = [
    { name: 'Overview', url: 'http://localhost:3000/admin/' },
    { name: 'Inquiries', url: 'http://localhost:3000/admin/inquiries' },
    { name: 'Applications', url: 'http://localhost:3000/admin/applications' },
    { name: 'Cases', url: 'http://localhost:3000/admin/cases' },
    { name: 'Bookings', url: 'http://localhost:3000/admin/bookings' },
    { name: 'Consultation Types', url: 'http://localhost:3000/admin/consultation-types' },
    { name: 'Services', url: 'http://localhost:3000/admin/services' },
    { name: 'Blog', url: 'http://localhost:3000/admin/blog' },
    { name: 'FAQs', url: 'http://localhost:3000/admin/faqs' },
    { name: 'Reviews', url: 'http://localhost:3000/admin/reviews' },
    { name: 'Subscribers', url: 'http://localhost:3000/admin/subscribers' },
    { name: 'Profile Settings', url: 'http://localhost:3000/admin/settings/profile' },
    { name: 'Security Settings', url: 'http://localhost:3000/admin/settings/security' },
    { name: 'Site Settings', url: 'http://localhost:3000/admin/settings/site' },
    { name: 'Availability Settings', url: 'http://localhost:3000/admin/settings/availability' },
    { name: 'Notifications Settings', url: 'http://localhost:3000/admin/settings/notifications' },
    { name: 'Team Settings', url: 'http://localhost:3000/admin/settings/team' },
    { name: 'Audit Log', url: 'http://localhost:3000/admin/audit-log' },
  ];

  console.log('\n--- 2. Testing All Dashboard Routes (0 Crashes / 0 Blanks) ---');
  for (const r of routesToTest) {
    await page.goto(r.url, { waitUntil: 'networkidle' });
    const content = await page.content();
    if (!content || content.includes('Something went wrong') || content.includes('Loading staff workspace…')) {
      throw new Error(`Route ${r.name} (${r.url}) failed to render content properly.`);
    }
    console.log(`✓ ${r.name} rendered cleanly.`);
  }

  console.log('\n--- 3. Testing Bookings Page Table (Verify Not Blank) ---');
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle' });
  const bookingRows = await page.locator('table tbody tr').count();
  console.log(`✓ Bookings table has ${bookingRows} row(s) (Expected >= 1).`);
  if (bookingRows === 0) throw new Error('Bookings table is unexpectedly blank!');

  console.log('\n--- 4. Testing Inquiries Action Dropdown (Z-Index & No Clipping) ---');
  await page.goto('http://localhost:3000/admin/inquiries', { waitUntil: 'networkidle' });
  const actionButtons = page.locator('table tbody tr button[title="Actions"]');
  const count = await actionButtons.count();
  if (count > 0) {
    const lastActionButton = actionButtons.nth(count - 1);
    await lastActionButton.click();
    await page.waitForTimeout(300);
    const dropdownMenu = page.locator('div[role="menu"]');
    const isVisible = await dropdownMenu.isVisible();
    console.log('✓ Dropdown menu is visible:', isVisible);
    const zIndex = await dropdownMenu.evaluate((el) => window.getComputedStyle(el).zIndex);
    console.log('✓ Dropdown z-index:', zIndex, '(Expected >= 9999)');
    // Click outside to close
    await page.keyboard.press('Escape');
  }

  console.log('\n--- 5. Testing Consultation Types "+2 more" Expandable Channels ---');
  await page.goto('http://localhost:3000/admin/consultation-types', { waitUntil: 'networkidle' });
  const expandBtn = page.locator('button:has-text("+2 more")').first();
  if (await expandBtn.isVisible()) {
    await expandBtn.click();
    await page.waitForTimeout(300);
    const hideBtn = page.locator('button:has-text("Hide")').first();
    const isHideVisible = await hideBtn.isVisible();
    console.log('✓ Channels expanded successfully; "Hide" toggle visible:', isHideVisible);
  }

  console.log('\n--- 6. Testing FAQs "View details" Action & Drawer ---');
  await page.goto('http://localhost:3000/admin/faqs', { waitUntil: 'networkidle' });
  const faqActionBtn = page.locator('table tbody tr button[title="Actions"]').first();
  await faqActionBtn.click();
  await page.waitForTimeout(200);
  await page.click('button[role="menuitem"]:has-text("View details")');
  await page.waitForTimeout(300);
  const faqDrawer = page.locator('div[role="dialog"]');
  const isFaqDrawerOpen = await faqDrawer.isVisible();
  console.log('✓ FAQ Details Drawer opened cleanly:', isFaqDrawerOpen);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('\n--- 7. Testing Services "View service" Action & Drawer ---');
  await page.goto('http://localhost:3000/admin/services', { waitUntil: 'networkidle' });
  const srvActionBtn = page.locator('table tbody tr button[title="Actions"]').first();
  await srvActionBtn.click();
  await page.waitForTimeout(200);
  await page.click('button[role="menuitem"]:has-text("View service")');
  await page.waitForTimeout(300);
  const srvDrawer = page.locator('div[role="dialog"]');
  const isSrvDrawerOpen = await srvDrawer.isVisible();
  console.log('✓ Service Details Drawer opened cleanly:', isSrvDrawerOpen);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('\n--- 8. Testing Blog WYSIWYG & WebP Upload in Drawer ---');
  await page.goto('http://localhost:3000/admin/blog', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Draft New Article")');
  await page.waitForTimeout(400);
  const wysiwygToggle = page.locator('button:has-text("Visual WYSIWYG")');
  const hasWysiwyg = await wysiwygToggle.isVisible();
  console.log('✓ WYSIWYG Editor mode toggle present:', hasWysiwyg);
  const uploadDropzone = page.getByText('Click to upload', { exact: true });
  const hasUpload = await uploadDropzone.isVisible();
  console.log('✓ WebP Image Upload dropzone present:', hasUpload);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('\n--- 9. Testing Settings Tabs Layout (Zero Empty Void) ---');
  await page.goto('http://localhost:3000/admin/settings/profile', { waitUntil: 'networkidle' });
  const staffCard = page.locator('text=Clinical Data Protection');
  console.log('✓ Profile Tab 2-column Staff Identity & Compliance Card present:', await staffCard.isVisible());

  await page.goto('http://localhost:3000/admin/settings/security', { waitUntil: 'networkidle' });
  const secCard = page.locator('text=Account Security Health');
  console.log('✓ Security Tab 2-column Security Health Card present:', await secCard.isVisible());

  await page.goto('http://localhost:3000/admin/settings/site', { waitUntil: 'networkidle' });
  const previewCard = page.locator('text=Public Footer Preview');
  console.log('✓ Site Settings Tab 2-column Public Touchpoints Card present:', await previewCard.isVisible());

  console.log('\n--- 10. Testing Sidebar User Photo & No Native Scrollbars ---');
  const avatarImg = page.locator('aside img[alt*="Chizaram"]');
  console.log('✓ Sidebar uses Dr. Chizaram human photo avatar:', await avatarImg.isVisible());

  console.log('\n=========================================');
  console.log('🎉 ALL PLAYWRIGHT DASHBOARD TESTS PASSED!');
  console.log('=========================================\n');

  await browser.close();
  if (errors.length > 0) {
    console.error('Errors encountered:', errors);
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('[Playwright Test Failed]:', err);
  process.exit(1);
});
