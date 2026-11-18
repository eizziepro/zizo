import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Input } from '../../components/untitledui/Input';
import { Textarea } from '../../components/untitledui/Textarea';
import { Toggle } from '../../components/untitledui/Toggle';
import { Button } from '../../components/untitledui/Button';

export const SiteSettingsTab: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [businessName, setBusinessName] = useState('Zizo Donor and Surrogacy');
  const [tagline, setTagline] = useState('Safe fertility care across borders');
  const [contactEmail, setContactEmail] = useState('care@zizodonorandsurrogacy.com');
  const [notificationEmail, setNotificationEmail] = useState('coordinator@zizodonorandsurrogacy.com');
  const [contactPhone, setContactPhone] = useState('+234 (0) 123 456 7890');
  const [whatsappNumber, setWhatsappNumber] = useState('2348000000000');
  const [address, setAddress] = useState('Lagos, Nigeria');
  const [businessHours, setBusinessHours] = useState('Monday - Friday, 09:00 - 17:00 (WAT)');

  // Toggles
  const [reviewsRequireModeration, setReviewsRequireModeration] = useState(true);
  const [bookingsAutoConfirm, setBookingsAutoConfirm] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await logAction({
        action: 'UPDATE_SITE_SETTINGS',
        tableName: 'site_settings',
        diff: {
          businessName,
          contactEmail,
          reviewsRequireModeration,
          bookingsAutoConfirm,
        },
      });
      toast('Site Settings Saved', 'Public clinic configurations were updated.', 'success');
    } catch (err: any) {
      toast('Error', err.message || 'Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Site Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          {/* Brand & Organization info */}
          <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-semibold text-[#17191A]">Clinic &amp; Brand Identity</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Public Contact Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              <Input
                label="Internal Notification Email"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Telephone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
              <Input
                label="WhatsApp Number (International format)"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>

            <Input
              label="Physical Clinic / Headquarters Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <Input
              label="Business Hours Description"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
            />
          </div>

          {/* Operational Toggles */}
          <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-semibold text-[#17191A]">Operational Controls &amp; Policies</h3>

            <div className="space-y-5">
              <Toggle
                checked={reviewsRequireModeration}
                onChange={setReviewsRequireModeration}
                label="Reviews Require Clinical Moderation"
                description="Submitted reviews will remain in 'pending' status until explicitly approved by an authorized editor or owner."
              />

              <Toggle
                checked={bookingsAutoConfirm}
                onChange={setBookingsAutoConfirm}
                label="Auto-Confirm Consultations"
                description="When enabled, new consultation appointments are immediately confirmed without manual coordinator review."
              />

              <Toggle
                checked={emailNotificationsEnabled}
                onChange={setEmailNotificationsEnabled}
                label="Transactional Email Notifications"
                description="Dispatch automated confirmation, reschedule, and reminder emails via Resend."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isSaving}>
              Save Site Settings
            </Button>
          </div>
        </form>

        {/* Right column: Public Touchpoint Preview & Platform Status */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Public Preview Card */}
          <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#17191A]">Public Footer Preview</h4>
              <span className="text-[10px] text-[#5D5E5F] font-mono uppercase bg-[#FAF9F6] border border-[#E1E0DD] px-2 py-0.5 rounded">
                Live
              </span>
            </div>
            <p className="text-xs text-[#5D5E5F]">
              How the clinic&apos;s contact touchpoints appear to prospective intended parents:
            </p>

            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-3 text-xs">
              <div>
                <p className="font-semibold text-[#17191A]">{businessName}</p>
                <p className="text-[#5D5E5F] italic">{tagline}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E1E0DD] text-[#5D5E5F]">
                <p>📍 {address}</p>
                <p>✉️ {contactEmail}</p>
                <p>📞 {contactPhone}</p>
                <p>💬 WhatsApp: +{whatsappNumber}</p>
                <p className="text-[11px] font-mono text-[#17645F] pt-1">🕒 {businessHours}</p>
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="bg-[#FAF9F6] border border-[#E1E0DD] rounded-[10px] p-5 shadow-xs space-y-3 text-xs">
            <h4 className="font-semibold text-[#17191A] uppercase tracking-wider text-[11px]">
              Platform &amp; Edge Sync
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#5D5E5F]">Static Rebuild:</span>
                <span className="font-medium text-[#17645F]">Auto-Triggered on Save</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5D5E5F]">Timezone:</span>
                <span className="font-mono text-[#17191A]">Africa/Lagos (WAT)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5D5E5F]">Compliance:</span>
                <span className="font-medium text-[#2E7D32]">NDPA 2023 · GDPR</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
