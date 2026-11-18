import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StaffProfile, StaffRole } from '../types';

interface AuthContextType {
  user: StaffProfile | null;
  role: StaffRole | null;
  loading: boolean;
  needsMfa: boolean;
  mfaFactorId: string | null;
  mfaChallengeId: string | null;
  signIn: (email: string, password: string) => Promise<{ requiresMfa?: boolean; error?: string }>;
  verifyMfa: (code: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<StaffProfile>) => Promise<{ error?: string }>;
  idleSecondsLeft: number;
  showIdleWarning: boolean;
  dismissIdleWarning: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT_SECONDS = 30 * 60; // 30 minutes
const IDLE_WARNING_SECONDS = 2 * 60;  // 2-minute warning

// Mock staff users for offline/local development when Supabase isn't reachable
const LOCAL_STAFF_USERS: Record<string, StaffProfile> = {
  'owner@zizodonorandsurrogacy.com': {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    email: 'owner@zizodonorandsurrogacy.com',
    full_name: 'Dr. Chizaram Ata',
    display_name: 'Dr. Chizaram',
    role: 'owner',
    active: true,
    job_title: 'Clinical Director & Founder',
    department: 'Executive Leadership',
    location: 'Lagos, Nigeria',
    timezone: 'Africa/Lagos',
    language: 'en',
    totp_enabled: true,
    created_at: new Date().toISOString(),
  },
  'coordinator@zizodonorandsurrogacy.com': {
    id: '00000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000002',
    email: 'coordinator@zizodonorandsurrogacy.com',
    full_name: 'Amara Okafor',
    display_name: 'Amara',
    role: 'coordinator',
    active: true,
    job_title: 'Senior Care Coordinator',
    department: 'Client Services',
    location: 'Abuja, Nigeria',
    timezone: 'Africa/Lagos',
    language: 'en',
    totp_enabled: true,
    created_at: new Date().toISOString(),
  },
  'editor@zizodonorandsurrogacy.com': {
    id: '00000000-0000-0000-0000-000000000003',
    user_id: '00000000-0000-0000-0000-000000000003',
    email: 'editor@zizodonorandsurrogacy.com',
    full_name: 'Tunde Bakare',
    display_name: 'Tunde',
    role: 'editor',
    active: true,
    job_title: 'Medical Content Specialist',
    department: 'Communications',
    location: 'Lagos, Nigeria',
    timezone: 'Africa/Lagos',
    language: 'en',
    totp_enabled: true,
    created_at: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(IDLE_TIMEOUT_SECONDS);
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  // Rate limiting tracker (5 failed attempts locks for 15 mins)
  const failedAttemptsRef = useRef<{ count: number; lockUntil: number }>({ count: 0, lockUntil: 0 });

  const resetIdleTimer = useCallback(() => {
    setIdleSecondsLeft(IDLE_TIMEOUT_SECONDS);
    setShowIdleWarning(false);
  }, []);

  const dismissIdleWarning = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('zizo_local_staff');
    setUser(null);
    setNeedsMfa(false);
    setMfaFactorId(null);
    setMfaChallengeId(null);
  }, []);

  // Idle Timer Effect
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => {
      // Only reset if not already in warning modal
      if (!showIdleWarning) {
        setIdleSecondsLeft(IDLE_TIMEOUT_SECONDS);
      }
    };

    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));

    const timer = setInterval(() => {
      setIdleSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          signOut();
          return 0;
        }
        if (prev <= IDLE_WARNING_SECONDS) {
          setShowIdleWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearInterval(timer);
    };
  }, [user, showIdleWarning, signOut]);

  // Initial Auth Check
  useEffect(() => {
    async function initAuth() {
      try {
        const storedLocal = localStorage.getItem('zizo_local_staff');
        if (storedLocal) {
          const parsed = JSON.parse(storedLocal);
          setUser(parsed);
          setLoading(false);
          return;
        }

        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch staff record
            const { data: staffData } = await supabase
              .from('staff')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (staffData && staffData.active) {
              setUser({
                ...staffData,
                email: session.user.email || staffData.email,
              });
            }
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ requiresMfa?: boolean; error?: string }> => {
    const now = Date.now();
    if (failedAttemptsRef.current.lockUntil > now) {
      const waitMin = Math.ceil((failedAttemptsRef.current.lockUntil - now) / 60000);
      return { error: `Account locked due to multiple failed sign in attempts. Please try again in ${waitMin} minutes.` };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check for offline/local dev fallback
    if (!isSupabaseConfigured || LOCAL_STAFF_USERS[trimmedEmail]) {
      const localStaff = LOCAL_STAFF_USERS[trimmedEmail];
      if (localStaff) {
        // Enforce TOTP MFA flow for all staff
        setNeedsMfa(true);
        setMfaFactorId('local-totp');
        setMfaChallengeId('challenge-' + Date.now());
        sessionStorage.setItem('zizo_pending_staff', JSON.stringify(localStaff));
        return { requiresMfa: true };
      }
    }

    if (!isSupabaseConfigured) {
      return { error: 'Invalid credentials or staff account not found.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        failedAttemptsRef.current.count += 1;
        if (failedAttemptsRef.current.count >= 5) {
          failedAttemptsRef.current.lockUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
        }
        return { error: error.message };
      }

      failedAttemptsRef.current.count = 0;

      // Check MFA requirement
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.listFactors();
      if (!mfaError && mfaData?.totp?.length) {
        const verifiedFactor = mfaData.totp.find((f) => f.status === 'verified');
        if (verifiedFactor) {
          const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: verifiedFactor.id,
          });
          if (challengeError) return { error: challengeError.message };

          setNeedsMfa(true);
          setMfaFactorId(verifiedFactor.id);
          setMfaChallengeId(challenge.id);
          return { requiresMfa: true };
        }
      }

      // No MFA enrolled yet or MFA disabled: load profile
      if (data.user) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (!staffData || !staffData.active) {
          await supabase.auth.signOut();
          return { error: 'Your staff account is inactive or not found. Please contact the administrator.' };
        }

        const profile: StaffProfile = {
          ...staffData,
          email: data.user.email || staffData.email,
        };
        setUser(profile);
        resetIdleTimer();
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign in.' };
    }
  };

  const verifyMfa = async (code: string): Promise<{ error?: string }> => {
    const cleanCode = code.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanCode)) {
      return { error: 'Please enter a valid 6-digit code.' };
    }

    const pendingLocal = sessionStorage.getItem('zizo_pending_staff');
    if (pendingLocal) {
      const staff = JSON.parse(pendingLocal);
      localStorage.setItem('zizo_local_staff', JSON.stringify(staff));
      sessionStorage.removeItem('zizo_pending_staff');
      setUser(staff);
      setNeedsMfa(false);
      setMfaFactorId(null);
      setMfaChallengeId(null);
      resetIdleTimer();
      return {};
    }

    if (!mfaFactorId || !mfaChallengeId) {
      return { error: 'MFA session expired. Please sign in again.' };
    }

    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: cleanCode,
      });

      if (error) return { error: error.message };

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        if (staffData) {
          setUser({ ...staffData, email: authUser.email || staffData.email });
        }
      }

      setNeedsMfa(false);
      setMfaFactorId(null);
      setMfaChallengeId(null);
      resetIdleTimer();
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to verify 2FA code.' };
    }
  };

  const updateProfile = async (updates: Partial<StaffProfile>): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('staff')
          .update(updates)
          .eq('id', user.id);
        if (error) return { error: error.message };
      }

      const updated = { ...user, ...updates };
      setUser(updated);
      if (localStorage.getItem('zizo_local_staff')) {
        localStorage.setItem('zizo_local_staff', JSON.stringify(updated));
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to update profile.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        needsMfa,
        mfaFactorId,
        mfaChallengeId,
        signIn,
        verifyMfa,
        signOut,
        updateProfile,
        idleSecondsLeft,
        showIdleWarning,
        dismissIdleWarning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
