import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Input } from '../../components/untitledui/Input';
import { Toggle } from '../../components/untitledui/Toggle';
import { Button } from '../../components/untitledui/Button';
import { Globe01, CheckCircle } from '@untitledui/icons';

export const SiteSettingsTab: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [businessName, setBusinessName] = useState('Zizo Donor and Surrogacy');
  const [tagline, setTagline] = useState('Safe fertility care across borders');
  const [contactEmail, setContactEmail] = useState('info@zizosurrogacy.com');
  const [notificationEmail, setNotificationEmail] = useState('info@zizosurrogacy.com');
  const [contactPhone, setContactPhone] = useState('09024944961');
  const [whatsappNumber, setWhatsappNumber] = useState('2349024944961');
  const [address, setAddress] = useState('Bode Thomas St, Surulere, Lagos');
  const [businessHours, setBusinessHours] = useState('Monday - Friday, 09:00 - 17:00 (WAT)');

  // Toggles
  const [reviewsRequireModeration, setReviewsRequireModeration] = useState(true);
  const [bookingsAutoConfirm, setBookingsAutoConfirm] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.settings) {
          const s = data.settings;
          if (s.brand_name) setBusinessName(s.brand_name);
          if (s.contact_email) setContactEmail(s.contact_email);
          if (s.notification_emails) setNotificationEmail(s.notification_emails);
          if (s.contact_phone) setContactPhone(s.contact_phone);
          if (s.whatsapp_number) setWhatsappNumber(s.whatsapp_number);
          if (s.contact_address) setAddress(s.contact_address);
          if (s.business_hours) setBusinessHours(s.business_hours);
          if (typeof s.auto_confirm_bookings === 'boolean') setBookingsAutoConfirm(s.auto_confirm_bookings);
        }
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = {
        brand_name: businessName,
        contact_email: contactEmail,
        notification_emails: notificationEmail,
        contact_phone: contactPhone,
        whatsapp_number: whatsappNumber,
        contact_address: address,
        business_hours: businessHours,
        auto_confirm_bookings: bookingsAutoConfirm,
      };

      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      await logAction({
        action: 'UPDATE_SITE_SETTINGS',
        tableName: 'site_settings',
        diff: updates,
      });
      toast('Site Settings Saved', 'Public clinic configurations were updated.', 'success');
    } catch (err: any) {
      toast('Error', err.message || 'Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full text-left space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Clinic & Brand Identity */}
        <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center shrink-0">
              <Globe01 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#17191A]">Clinic &amp; Brand Identity</h3>
              <p className="text-xs text-[#5D5E5F]">
                Public brand presence, registered clinic details, and international concierge contact endpoints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Organization Brand Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <Input
              label="Brand Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Public Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              helperText="Displayed in public website header, footer, and inquiry forms."
            />
            <Input
              label="Internal Notification Email"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              helperText="Receives staff booking notifications, screening alerts, and audit dispatches."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Primary Telephone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="09024944961"
            />
            <Input
              label="WhatsApp Number (International Concierge)"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="2349024944961"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Physical Clinic / Lagos Headquarters Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Bode Thomas St, Surulere, Lagos"
            />
            <Input
              label="Business Hours Description"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="Monday - Friday, 09:00 - 17:00 (WAT)"
            />
          </div>
        </div>

        {/* Card 2: Operational Controls & Automation */}
        <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-semibold text-[#17191A]">Operational Controls &amp; Intake Policies</h3>
            <p className="text-xs text-[#5D5E5F] mt-0.5">
              Automated rules governing new consultation approvals, story reviews, and client notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] flex flex-col justify-between space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#17191A]">Clinical Review Moderation</p>
                <p className="text-[11px] text-[#5D5E5F] mt-1 leading-relaxed">
                  Submitted patient stories remain pending until approved by clinical editors or owners.
                </p>
              </div>
              <Toggle
                checked={reviewsRequireModeration}
                onChange={setReviewsRequireModeration}
                label="Require Moderation"
              />
            </div>

            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] flex flex-col justify-between space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#17191A]">Auto-Confirm Consultations</p>
                <p className="text-[11px] text-[#5D5E5F] mt-1 leading-relaxed">
                  Automatically confirm bookings without manual staff review when slots are available.
                </p>
              </div>
              <Toggle
                checked={bookingsAutoConfirm}
                onChange={setBookingsAutoConfirm}
                label="Auto-Confirm"
              />
            </div>

            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] flex flex-col justify-between space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#17191A]">Transactional Email Alerts</p>
                <p className="text-[11px] text-[#5D5E5F] mt-1 leading-relaxed">
                  Dispatch automated booking confirmations, reschedule links, and calendar invites.
                </p>
              </div>
              <Toggle
                checked={emailNotificationsEnabled}
                onChange={setEmailNotificationsEnabled}
                label="Enable Dispatches"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Live Preview & Platform Synchronization */}
        <div className="bg-[#FAF9F6] border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E0DD] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#17645F]" />
              <h4 className="text-xs font-semibold text-[#17191A] uppercase tracking-wider">
                Public Website Synchronized Touchpoints
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#17645F] bg-[#E2ECEB] px-2 py-0.5 rounded border border-[#C5D8D7]">
              Live in Lagos &amp; Global CDN
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] space-y-2 shadow-2xs">
              <p className="font-semibold text-[#17191A]">{businessName}</p>
              <p className="text-[#5D5E5F] italic">{tagline}</p>
              <div className="pt-2 border-t border-[#E1E0DD] space-y-1 text-[#5D5E5F]">
                <p>📍 {address}</p>
                <p>✉️ {contactEmail}</p>
                <p>📞 {contactPhone} · 💬 WhatsApp: +{whatsappNumber}</p>
                <p className="font-mono text-[#17645F] text-[11px] pt-0.5">🕒 {businessHours}</p>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] space-y-2.5 shadow-2xs">
              <p className="font-semibold text-[#17191A]">System Architecture &amp; Data Pipeline</p>
              <div className="space-y-1.5 text-[#5D5E5F]">
                <div className="flex items-center justify-between">
                  <span>Supabase Cloud Database:</span>
                  <span className="font-semibold text-[#2E7D32]">Connected (RLS Enforced)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>SQLite Local Replica:</span>
                  <span className="font-mono text-[#17191A]">Active Sync</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Static Site Rebuild:</span>
                  <span className="font-medium text-[#17645F]">Auto-Triggered on Save</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Timezone Standard:</span>
                  <span className="font-mono text-[#17191A]">Africa/Lagos (WAT, UTC+1)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" isLoading={isSaving} size="md">
            Save site configurations
          </Button>
        </div>
      </form>
    </div>
  );
};