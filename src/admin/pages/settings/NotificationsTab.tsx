import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Toggle } from '../../components/untitledui/Toggle';
import { Button } from '../../components/untitledui/Button';

export const NotificationsTab: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [notifBooking, setNotifBooking] = useState(true);
  const [notifInquiry, setNotifInquiry] = useState(true);
  const [notifApplication, setNotifApplication] = useState(true);
  const [notifReview, setNotifReview] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await logAction({
        action: 'UPDATE_NOTIFICATION_PREFS',
        tableName: 'staff',
        diff: {
          booking: notifBooking,
          inquiry: notifInquiry,
          application: notifApplication,
          review: notifReview,
        },
      });
      toast('Preferences Saved', 'Your staff notification preferences were updated.', 'success');
    } catch (err: any) {
      toast('Error', err.message || 'Failed to save preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl text-left">
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-6 shadow-xs">
        <div>
          <h3 className="text-base font-semibold text-[#17191A]">Email Notification Alerts</h3>
          <p className="text-xs text-[#5D5E5F] mt-0.5">
            Select the activity events for which you want to receive direct email dispatches.
          </p>
        </div>

        <div className="space-y-5">
          <Toggle
            checked={notifBooking}
            onChange={setNotifBooking}
            label="New Consultation Bookings"
            description="Receive an email alert whenever an intended parent schedules or reschedules a consultation."
          />

          <Toggle
            checked={notifInquiry}
            onChange={setNotifInquiry}
            label="Inbound Inquiries &amp; Messages"
            description="Receive an alert when a contact form or cost inquiry is submitted."
          />

          <Toggle
            checked={notifApplication}
            onChange={setNotifApplication}
            label="Surrogate &amp; Donor Applications"
            description="Receive an alert when an initial screening questionnaire is completed."
          />

          <Toggle
            checked={notifReview}
            onChange={setNotifReview}
            label="Pending Review Submissions"
            description="Alert when a parent, surrogate, or donor submits a feedback story requiring moderation."
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isSaving}>
          Save Notification Preferences
        </Button>
      </div>
    </form>
  );
};
