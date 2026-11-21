import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Input } from '../../components/untitledui/Input';
import { Textarea } from '../../components/untitledui/Textarea';
import { Select } from '../../components/untitledui/Select';
import { Button } from '../../components/untitledui/Button';
import { Upload01, ShieldTick, CheckCircle, MarkerPin01, Globe01 } from '@untitledui/icons';

export const ProfileTab: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [jobTitle, setJobTitle] = useState(user?.job_title || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || 'Lagos, Nigeria');
  const [timezone, setTimezone] = useState(user?.timezone || 'Africa/Lagos');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_path || null);

  // More Information fields
  const [websiteLink, setWebsiteLink] = useState(user?.links?.website || '');
  const [linkedinLink, setLinkedinLink] = useState(user?.links?.linkedin || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergency_contact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergency_contact?.phone || '');

  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('File Too Large', 'Avatar images must be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates = {
        full_name: fullName,
        display_name: displayName,
        phone,
        whatsapp,
        job_title: jobTitle,
        department,
        bio,
        location,
        timezone,
        language,
        avatar_path: avatarPreview,
        links: {
          website: websiteLink,
          linkedin: linkedinLink,
        },
        emergency_contact: {
          name: emergencyName,
          phone: emergencyPhone,
        },
      };

      const res = await updateProfile(updates);
      if (res.error) {
        toast('Update Failed', res.error, 'error');
      } else {
        await logAction({
          action: 'UPDATE_PROFILE',
          tableName: 'staff',
          recordId: user?.id,
          diff: updates,
        });
        toast('Profile Saved', 'Your staff profile details have been updated.', 'success');
      }
    } catch (err: any) {
      toast('Error', err.message || 'Failed to save changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full text-left space-y-6">
      {/* Full-width Profile Header Banner Card */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative w-20 h-20 rounded-full border-2 border-[#17645F] overflow-hidden shrink-0 flex items-center justify-center bg-[#FAF9F6] shadow-xs">
            <img
              src={avatarPreview || user?.avatar_path || '/assets/img/founder-about-chizaram-ata-640w.webp'}
              alt={fullName || 'Avatar'}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#17191A] font-heading">{fullName || 'Staff Member'}</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E2ECEB] text-[#17645F] border border-[#C5D8D7]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#17645F]" />
                {(user?.role || 'owner').toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2E7D32]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Active Coordinator</span>
              </span>
            </div>

            <p className="text-sm text-[#5D5E5F]">
              {jobTitle || 'Clinical Director'} {department ? `• ${department}` : '• Leadership'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#5D5E5F] pt-1">
              <span className="inline-flex items-center gap-1">
                <MarkerPin01 className="w-3.5 h-3.5 text-[#8BB2AF]" />
                {location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Globe01 className="w-3.5 h-3.5 text-[#8BB2AF]" />
                {timezone}
              </span>
              <span className="inline-flex items-center gap-1 text-[#2E7D32]">
                <ShieldTick className="w-3.5 h-3.5 text-[#2E7D32]" />
                NDPA 2023 Compliant
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-2">
          <label className="btn-secondary !text-xs !py-2 !px-3.5 inline-flex items-center gap-2 cursor-pointer border border-[#E1E0DD] rounded-[8px] hover:bg-[#F0EFEC] transition-colors shadow-xs">
            <Upload01 className="w-4 h-4 text-[#17645F]" />
            <span className="font-semibold text-[#17191A]">Change photo</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
          <p className="text-[11px] text-[#969594]">Max 5MB. WebP, PNG, JPG.</p>
        </div>
      </div>

      {/* Main Profile Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Personal Information */}
        <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-semibold text-[#17191A]">Personal Information</h3>
            <p className="text-xs text-[#5D5E5F] mt-0.5">
              Primary identification credentials used on clinical coordination records and client portals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Display Name (Staff nickname)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Dr. Chizaram"
              helperText="How your name appears in calendar invites and confirmation notices."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Staff Email Address"
              disabled
              value={user?.email || ''}
              helperText="Managed by system administrators. Used for staff portal authentication."
            />
            <Input
              label="Staff Role &amp; Permissions"
              disabled
              value={(user?.role || 'staff').toUpperCase()}
              helperText="Access permissions are enforced server-side via Supabase Row-Level Security."
            />
          </div>
        </div>

        {/* Card 2: Department & Direct Contact */}
        <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-semibold text-[#17191A]">Department &amp; Direct Contact</h3>
            <p className="text-xs text-[#5D5E5F] mt-0.5">
              Contact routes for intended parents, surrogate candidates, and accredited clinic partners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Surrogacy Coordinator"
            />
            <Input
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Clinical Operations"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Direct Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09024944961"
            />
            <Input
              label="WhatsApp Number (Concierge)"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="2349024944961"
              helperText="Used for automated WhatsApp consultation confirmation dispatches."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lagos, Nigeria"
            />
            <Select
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT, UTC+1)' },
                { value: 'UTC', label: 'UTC' },
                { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
                { value: 'America/New_York', label: 'America/New_York (EST)' },
              ]}
            />
            <Select
              label="Preferred Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'French' },
              ]}
            />
          </div>

          <Textarea
            label="Professional Bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short coordinator biography presented on consultation scheduling confirmation and team introductions."
          />
        </div>

        {/* Card 3: More Information & Emergency Contact */}
        <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-semibold text-[#17191A]">Professional Links &amp; Emergency Contact</h3>
            <p className="text-xs text-[#5D5E5F] mt-0.5">
              Additional professional profiles and confidential emergency contact for staff records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Website or Portfolio URL"
              type="url"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              placeholder="https://..."
            />
            <Input
              label="LinkedIn Profile"
              type="url"
              value={linkedinLink}
              onChange={(e) => setLinkedinLink(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="border-t border-[#E1E0DD] pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldTick className="w-4 h-4 text-[#17645F]" />
              <h4 className="text-xs font-semibold text-[#17645F] uppercase tracking-wider">
                Confidential Emergency Contact (Internal Clinic Records Only)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Emergency Contact Full Name"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Next of kin or emergency representative"
              />
              <Input
                label="Emergency Contact Phone"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="09024944961"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Compliance & Data Protection Standards */}
        <div className="bg-[#FAF9F6] border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
            <h4 className="text-xs font-semibold text-[#17191A] uppercase tracking-wider">
              Clinical Data Protection &amp; Security Compliance
            </h4>
          </div>
          <p className="text-xs text-[#5D5E5F] leading-relaxed">
            Staff access and clinical operations are monitored and bound to strict Nigeria Data Protection Act (NDPA 2023) regulations, medical confidentiality laws, and internal Zizo protocols.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-[8px] bg-white border border-[#E1E0DD] shadow-2xs">
              <span className="text-[#5D5E5F]">Two-Factor Authentication</span>
              <span className="font-semibold text-[#2E7D32]">Mandatory Enrolled</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[8px] bg-white border border-[#E1E0DD] shadow-2xs">
              <span className="text-[#5D5E5F]">Auto-Lock Idle Inactivity</span>
              <span className="font-mono font-medium text-[#17191A]">30 minutes</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[8px] bg-white border border-[#E1E0DD] shadow-2xs">
              <span className="text-[#5D5E5F]">Audit Trail Telemetry</span>
              <span className="font-semibold text-[#17645F]">Full Logging Active</span>
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" isLoading={isSaving} size="md">
            Save profile changes
          </Button>
        </div>
      </form>
    </div>
  );
};