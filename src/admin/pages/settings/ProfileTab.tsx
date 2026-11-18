import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Input } from '../../components/untitledui/Input';
import { Textarea } from '../../components/untitledui/Textarea';
import { Select } from '../../components/untitledui/Select';
import { Button } from '../../components/untitledui/Button';
import { Upload01 } from '@untitledui/icons';

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
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl text-left">
      {/* Photo & Display Name Card */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-6 shadow-xs">
        <h3 className="text-base font-semibold text-[#17191A]">Personal Information</h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative w-20 h-20 rounded-full border border-[#E1E0DD] bg-[#FAF9F6] overflow-hidden shrink-0 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-[#17645F]">
                {(fullName || 'U').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="btn-secondary !text-xs !py-1.5 !px-3 inline-flex items-center gap-2 cursor-pointer border border-[#E1E0DD] rounded-[6px] hover:bg-[#F0EFEC]">
              <Upload01 className="w-3.5 h-3.5" />
              <span>Change photo</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-[#5D5E5F]">
              JPG, PNG, or WebP. 1:1 aspect ratio, max 5MB. Resized to 512px.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            disabled
            value={user?.email || ''}
            helperText="Staff email address is managed through system administrators."
          />
          <Input
            label="Staff Role"
            disabled
            value={(user?.role || 'staff').toUpperCase()}
            helperText="Role permissions are enforced server-side via Supabase RLS."
          />
        </div>
      </div>

      {/* Role & Contact Details */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-6 shadow-xs">
        <h3 className="text-base font-semibold text-[#17191A]">Department &amp; Direct Contact</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Direct Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
          />
          <Input
            label="WhatsApp Number"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+234 800 000 0000"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          placeholder="Short coordinator bio shown on booking confirmations and team introductions."
        />
      </div>

      {/* More Information Section */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 space-y-6 shadow-xs">
        <div>
          <h3 className="text-base font-semibold text-[#17191A]">More Information</h3>
          <p className="text-xs text-[#5D5E5F] mt-0.5">
            Additional professional links and confidential emergency contacts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Website Link"
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

        <div className="border-t border-[#E1E0DD] pt-4 space-y-4">
          <h4 className="text-xs font-semibold text-[#8BB2AF] uppercase tracking-wider">
            Confidential Emergency Contact (Visible to Owners Only)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Full Name"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
            />
            <Input
              label="Contact Phone"
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isSaving}>
          Save profile changes
        </Button>
      </div>
    </form>
  );
};
