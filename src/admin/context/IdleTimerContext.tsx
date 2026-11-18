import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

interface IdleTimerContextType {
  idleSecondsLeft: number;
  showIdleWarning: boolean;
  dismissIdleWarning: () => void;
}

const IdleTimerContext = createContext<IdleTimerContextType | undefined>(undefined);

const IDLE_TIMEOUT_SECONDS = 30 * 60; // 30 minutes
const IDLE_WARNING_SECONDS = 2 * 60;  // 2-minute warning modal

export const IdleTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(IDLE_TIMEOUT_SECONDS);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const lastActivityRef = useRef(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleSecondsLeft(IDLE_TIMEOUT_SECONDS);
    setShowIdleWarning(false);
  }, []);

  const dismissIdleWarning = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!user) return;

    // Reset timestamp on user events (throttled to avoid redundant state updates)
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (showIdleWarning) {
        setShowIdleWarning(false);
      }
    };

    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, IDLE_TIMEOUT_SECONDS - elapsedSeconds);
      setIdleSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        signOut();
      } else if (remaining <= IDLE_WARNING_SECONDS) {
        setShowIdleWarning(true);
      }
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearInterval(interval);
    };
  }, [user, showIdleWarning, signOut]);

  return (
    <IdleTimerContext.Provider value={{ idleSecondsLeft, showIdleWarning, dismissIdleWarning }}>
      {children}
    </IdleTimerContext.Provider>
  );
};

export function useIdleTimer() {
  const context = useContext(IdleTimerContext);
  if (!context) {
    return {
      idleSecondsLeft: IDLE_TIMEOUT_SECONDS,
      showIdleWarning: false,
      dismissIdleWarning: () => {},
    };
  }
  return context;
}
