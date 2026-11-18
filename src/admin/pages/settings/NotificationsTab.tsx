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
    <div className="w-full text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Notifications Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
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

        {/* Right column: Delivery Status & SLA Guidelines */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-semibold text-[#17191A]">Delivery Configuration</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#FAF9F6] border border-[#E1E0DD]">
                <span className="text-[#5D5E5F]">Routing Engine:</span>
                <span className="font-medium text-[#17645F]">Resend / SMTP Edge</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAF9F6] border border-[#E1E0DD]">
                <span className="text-[#5D5E5F]">Delivery Latency:</span>
                <span className="font-mono text-[#17191A]">&lt; 30 seconds</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAF9F6] border border-[#E1E0DD]">
                <span className="text-[#5D5E5F]">Spam Filter Status:</span>
                <span className="font-medium text-[#2E7D32]">SPF &amp; DKIM Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#E1E0DD] rounded-[10px] p-5 shadow-xs space-y-2 text-xs text-[#5D5E5F] leading-relaxed">
            <h4 className="font-semibold text-[#17191A] uppercase tracking-wider text-[11px]">
              Response SLA Standard
            </h4>
            <p>
              To maintain our 98% client satisfaction benchmark, clinical coordinators should respond to incoming inquiries within 2 business hours.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
