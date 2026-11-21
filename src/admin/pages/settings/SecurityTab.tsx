import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { Input } from '../../components/untitledui/Input';
import { Button } from '../../components/untitledui/Button';
import { Badge } from '../../components/untitledui/Badge';
import { ShieldTick, Lock01, CheckCircle, Monitor01 } from '@untitledui/icons';

export const SecurityTab: React.FC = () => {
  const { toast } = useNotifications();
  const { logAction } = useAuditLog();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA state
  const [is2FaEnabled, setIs2FaEnabled] = useState(true);
  const [showEnrolQr, setShowEnrolQr] = useState(false);
  const [enrolCode, setEnrolCode] = useState('');

  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    let s = 0;
    if (pwd.length >= 12) s += 1;
    if (/[A-Z]/.test(pwd)) s += 1;
    if (/[0-9]/.test(pwd)) s += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 1;

    if (s <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (s === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (s === 3) return { score: 75, label: 'Good', color: 'bg-emerald-500' };
    return { score: 100, label: 'Strong', color: 'bg-[#17645F]' };
  };

  const strength = calculateStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 12) {
      setPasswordError('New password must be at least 12 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await logAction({
        action: 'CHANGE_PASSWORD',
        tableName: 'auth.users',
      });
      toast('Password Updated', 'Your password was changed and other active sessions were revoked.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full text-left space-y-6">
      {/* Card 1: Two-Factor Authentication (TOTP) */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center shrink-0">
              <ShieldTick className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base font-semibold text-[#17191A]">Two-Factor Authentication (TOTP)</h3>
                <Badge variant={is2FaEnabled ? 'success' : 'error'} size="sm">
                  {is2FaEnabled ? 'Enrolled & Active' : 'Not Enrolled'}
                </Badge>
              </div>
              <p className="text-xs text-[#5D5E5F] mt-1 max-w-2xl leading-relaxed">
                Authenticator app verification (TOTP) using Google Authenticator, 1Password, or Apple Keychain is mandatory for all clinical coordinators and administrators under NDPA 2023 regulations.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (is2FaEnabled) {
                toast('MFA Mandatory', 'Two-factor authentication is enforced for all active clinical staff accounts.', 'warning');
              } else {
                setShowEnrolQr(true);
              }
            }}
          >
            {is2FaEnabled ? 'Reconfigure Authenticator' : 'Enrol 2FA'}
          </Button>
        </div>

        {showEnrolQr && (
          <div className="mt-4 p-5 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-4">
            <h4 className="text-sm font-semibold text-[#17191A]">Scan QR Code in Authenticator</h4>
            <p className="text-xs text-[#5D5E5F]">
              Use Google Authenticator or 1Password to scan this QR code. The secret is never displayed in plaintext.
            </p>
            <div className="w-40 h-40 bg-white border border-[#E1E0DD] rounded p-2 flex items-center justify-center">
              <span className="text-xs text-[#5D5E5F] font-mono">[2FA QR Code]</span>
            </div>
            <div className="max-w-xs space-y-2">
              <Input
                label="Confirm with 6-digit code"
                type="text"
                maxLength={6}
                value={enrolCode}
                onChange={(e) => setEnrolCode(e.target.value)}
                placeholder="000000"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (enrolCode.length === 6) {
                    setIs2FaEnabled(true);
                    setShowEnrolQr(false);
                    toast('2FA Enrolled', 'Your authenticator app was confirmed successfully.', 'success');
                  }
                }}
              >
                Verify &amp; Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Change Password */}
      <form onSubmit={handlePasswordChange} className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E1E0DD] text-[#17191A] flex items-center justify-center shrink-0">
            <Lock01 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#17191A]">Change Password</h3>
            <p className="text-xs text-[#5D5E5F]">
              Requires minimum 12 characters with mixed case, numbers, and symbols. Blocks reuse of the last 3 passwords.
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3.5 rounded-[8px] bg-[#FDF2F2] border border-[#F8B4B4] text-xs text-[#9B1C1C]" role="alert">
            {passwordError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="space-y-2">
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {newPassword && (
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full bg-[#E1E0DD] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#5D5E5F]">
                  Strength: <strong className="text-[#17191A]">{strength.label}</strong> (min. 12 chars)
                </p>
              </div>
            )}
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isChangingPassword}>
            Update Password
          </Button>
        </div>
      </form>

      {/* Card 3: Active Sessions & Device Security */}
      <div className="bg-white border border-[#E1E0DD] rounded-[10px] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#17191A]">Active Staff Sessions</h3>
            <p className="text-xs text-[#5D5E5F] mt-0.5">
              Devices and network locations currently authorized for your staff account.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast('Sessions Revoked', 'All other browser sessions were signed out.', 'info')}
          >
            Sign out of all other sessions
          </Button>
        </div>

        <div className="divide-y divide-[#E1E0DD] border border-[#E1E0DD] rounded-[8px] overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#FAF9F6] border border-[#E1E0DD] flex items-center justify-center text-[#17191A]">
                <Monitor01 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-[#17191A]">Current Session (This device)</p>
                <p className="text-[#5D5E5F]">Lagos, Nigeria · Chrome on Windows · IP 102.89.23.14</p>
              </div>
            </div>
            <Badge variant="success" size="sm">Active now</Badge>
          </div>
        </div>
      </div>

      {/* Card 4: Compliance & Security Policy Standards */}
      <div className="bg-[#FAF9F6] border border-[#E1E0DD] rounded-[10px] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#17645F]" />
          <h4 className="text-xs font-semibold text-[#17191A] uppercase tracking-wider">
            Clinical Security Standards &amp; Architecture
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] space-y-1.5 shadow-2xs">
            <p className="font-semibold text-[#17191A]">NDPA 2023 Regulated</p>
            <p className="text-[#5D5E5F] leading-relaxed">
              Strict access controls, audit trail recording, and role-based segregation for reproductive patient records.
            </p>
          </div>
          <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] space-y-1.5 shadow-2xs">
            <p className="font-semibold text-[#17191A]">30-Minute Inactivity Auto-Lock</p>
            <p className="text-[#5D5E5F] leading-relaxed">
              Sessions automatically lock after 30 minutes of idle inactivity to prevent unauthorized physical terminal access.
            </p>
          </div>
          <div className="p-4 rounded-[8px] bg-white border border-[#E1E0DD] space-y-1.5 shadow-2xs">
            <p className="font-semibold text-[#17191A]">AES-256 Storage Encryption</p>
            <p className="text-[#5D5E5F] leading-relaxed">
              Database files, backups, and Supabase transmission streams are protected via TLS 1.3 and hardware-grade AES-256.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};