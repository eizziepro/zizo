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
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl text-left">
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
  );
};
