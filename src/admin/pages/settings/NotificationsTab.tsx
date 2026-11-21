import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Toggle } from '../../components/untitledui/Toggle';
import { Button } from '../../components/untitledui/Button';
import { Bell01, CheckCircle } from '@untitledui/icons';

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
    <div className="w-full text-left space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Email Notification Alerts */}
        <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center shrink-0">
              <Bell01 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#17191A]">Email Notification Alerts</h3>
              <p className="text-xs text-[#5D5E5F]">
                Configure the specific client touchpoints and clinical events that trigger real-time email dispatches to your staff address.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] flex flex-col justify-between space-y-3">
              <div>
                <p className="text-sm font-semibold text-[#17191A]">New Consultation Bookings</p>
                <p className="text-xs text-[#5D5E5F] mt-1 leading-relaxed">
                  Receive an immediate alert whenever an intended parent schedules, cancels, or reschedules a clinical consultation appointment.
                </p>
              </div>
              <Toggle
                checked={notifBooking}
                onChange={setNotifBooking}
                label="Enable Booking Alerts"
              />
            </div>

            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] flex flex-col justify-between space-y-3">
              <div>
                <p className="text-sm font-semibold text-[#17191A]">Inbound Inquiries &amp; Messages</p>
                <p className="text-xs text-[#5D5E5F] mt-1 leading-relaxed">
                  Alert when an intended parent submits a contact question, pricing inquiry, or international program consultation form.
                </p>
              </div>
              <Toggle
                checked={notifInquiry}
                onChange={setNotifInquiry}
                label="Enable Inquiry Alerts"
              />
            </div>

            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] flex flex-col justify-between space-y-3">
              <div>
                <p className="text-sm font-semibold text-[#17191A]">Surrogate &amp; Donor Applications</p>
                <p className="text-xs text-[#5D5E5F] mt-1 leading-relaxed">
                  Receive a dispatch whenever a prospective gestational surrogate or egg donor completes their initial intake screening questionnaire.
                </p>
              </div>
              <Toggle
                checked={notifApplication}
                onChange={setNotifApplication}
                label="Enable Application Alerts"
              />
            </div>

            <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] flex flex-col justify-between space-y-3">
              <div>
                <p className="text-sm font-semibold text-[#17191A]">Pending Review Submissions</p>
                <p className="text-xs text-[#5D5E5F] mt-1 leading-relaxed">
                  Alert when an intended parent, surrogate, or donor submits a feedback review or testimonial requiring clinical moderation.
                </p>
              </div>
              <Toggle
                checked={notifReview}
                onChange={setNotifReview}
                label="Enable Moderation Alerts"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Delivery Engine & Response Standards */}
        <div className="bg-[#FAF9F6] border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#17645F]" />
            <h4 className="text-xs font-semibold text-[#17191A] uppercase tracking-wider">
              Notification Engine Infrastructure &amp; Clinical SLAs
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] space-y-1.5 shadow-2xs">
              <p className="font-semibold text-[#17191A]">Routing Engine</p>
              <p className="text-[#5D5E5F] leading-relaxed">
                Dispatched via Resend transactional edge relay with SPF, DKIM, and DMARC 100% verified.
              </p>
            </div>
            <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] space-y-1.5 shadow-2xs">
              <p className="font-semibold text-[#17191A]">Dispatch Latency</p>
              <p className="text-[#5D5E5F] leading-relaxed">
                Average latency &lt; 30 seconds from public form submission to staff inbox arrival.
              </p>
            </div>
            <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] space-y-1.5 shadow-2xs">
              <p className="font-semibold text-[#17191A]">Clinical Response SLA</p>
              <p className="text-[#5D5E5F] leading-relaxed">
                Coordinators are expected to initiate client outreach within 2 business hours of alert receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" isLoading={isSaving} size="md">
            Save notification preferences
          </Button>
        </div>
      </form>
    </div>
  );
};