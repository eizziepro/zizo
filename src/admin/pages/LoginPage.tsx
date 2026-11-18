import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/untitledui/Button';
import { Input } from '../components/untitledui/Input';
import { Lock01, ShieldTick, ArrowLeft } from '@untitledui/icons';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const { signIn, verifyMfa, needsMfa } = useAuth();
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error);
      } else if (!res.requiresMfa) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await verifyMfa(totpCode);
      if (res.error) {
        setError(res.error);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5 text-[#17191A] hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-[#17645F] text-white flex items-center justify-center font-display font-semibold text-xl">
            Z
          </div>
          <span className="font-display text-2xl font-semibold tracking-tight text-[#17191A]">
            Zizo Staff Portal
          </span>
        </Link>
        <p className="text-sm text-[#5D5E5F]">
          Authorized clinical coordinators and staff members only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E1E0DD] rounded-[12px] sm:px-10 text-left">
          {error && (
            <div
              className="mb-6 rounded-[8px] bg-[#FDF2F2] border border-[#F8B4B4] p-3 text-xs text-[#9B1C1C] flex items-start gap-2"
              role="alert"
            >
              <span>{error}</span>
            </div>
          )}

          {isForgotPassword ? (
            /* Forgot Password View */
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#17191A]">Reset your password</h2>
                <p className="text-xs text-[#5D5E5F] mt-1">
                  Enter your registered staff email and we will dispatch a secure reset link.
                </p>
              </div>

              {forgotSent ? (
                <div className="rounded-[8px] bg-[#E2ECEB] border border-[#C5D8D7] p-4 text-xs text-[#17645F] space-y-2">
                  <p className="font-semibold">Reset instructions dispatched.</p>
                  <p>Check your email for the password recovery link.</p>
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotSent(false);
                    }}
                    className="!p-0 !text-[#17645F] underline"
                  >
                    Return to sign in
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <Input
                    label="Staff Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coordinator@zizodonorandsurrogacy.com"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-xs text-[#5D5E5F] hover:text-[#17191A] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                    </button>
                    <Button type="submit" isLoading={loading}>
                      Send reset link
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : needsMfa ? (
            /* TOTP Verification Step */
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#E2ECEB] text-[#17645F] flex items-center justify-center mb-3">
                  <ShieldTick className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-[#17191A]">Two-Factor Verification</h2>
                <p className="text-xs text-[#5D5E5F]">
                  Enter the 6-digit code from your authenticator app (Google Authenticator, 1Password, etc.).
                </p>
              </div>

              <div>
                <label htmlFor="totp-code" className="block text-sm font-medium text-[#17191A] mb-1.5">
                  6-Digit Authenticator Code
                </label>
                <input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-[8px] border border-[#E1E0DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F]"
                />
              </div>

              <Button type="submit" className="w-full justify-center" isLoading={loading}>
                Verify &amp; Sign in
              </Button>
            </form>
          ) : (
            /* Standard Email & Password Step */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-[#17191A]">Staff sign in</h2>
                <p className="text-xs text-[#5D5E5F] mt-0.5">
                  Enter your authorized staff credentials to continue.
                </p>
              </div>

              <Input
                label="Email address"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@zizodonorandsurrogacy.com"
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-[#17645F] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full justify-center" isLoading={loading}>
                Continue to Portal
              </Button>

              <div className="pt-4 border-t border-[#E1E0DD] text-center text-xs text-[#5D5E5F] space-y-1">
                <p>Sessions lock automatically after 30 minutes of inactivity.</p>
                <Link to="/" className="text-[#17645F] underline">
                  Return to public website
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
