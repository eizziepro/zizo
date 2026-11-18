import React, { useState } from 'react';
import { Eye, EyeOff } from '@untitledui/icons';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useNotifications } from '../../context/NotificationContext';

interface MaskedValueProps {
  value?: string | null;
  type: 'email' | 'phone';
  tableName: string;
  recordId: string;
  className?: string;
}

export const MaskedValue: React.FC<MaskedValueProps> = ({
  value,
  type,
  tableName,
  recordId,
  className = '',
}) => {
  const [revealed, setRevealed] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const { logRevealPii } = useAuditLog();
  const { toast } = useNotifications();

  if (!value) {
    return <span className="text-[#969594] italic text-xs">None</span>;
  }

  const maskValue = (val: string, t: 'email' | 'phone'): string => {
    if (t === 'email') {
      const parts = val.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const domain = parts[1];
        const maskedName = name.length > 1 ? `${name[0]}***` : `${name}***`;
        return `${maskedName}@${domain}`;
      }
      return '***@***';
    }

    // Phone masking (e.g. +234 *** 1234 or *** 1234)
    const cleaned = val.trim();
    if (cleaned.length > 4) {
      const lastFour = cleaned.slice(-4);
      const prefix = cleaned.startsWith('+') ? cleaned.slice(0, 4) : '';
      return prefix ? `${prefix} *** *** ${lastFour}` : `*** *** ${lastFour}`;
    }
    return '*** ***';
  };

  const handleToggleReveal = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!revealed) {
      setIsLogging(true);
      try {
        await logRevealPii(tableName, recordId, type);
        setRevealed(true);
        toast('PII Revealed', `Staff access to ${type} was recorded in the audit log.`, 'info');
      } catch (err) {
        console.error(err);
      } finally {
        setIsLogging(false);
      }
    } else {
      setRevealed(false);
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs whitespace-nowrap shrink-0 ${className}`}>
      <span className="text-[#2E3031] tracking-tight">{revealed ? value : maskValue(value, type)}</span>
      <button
        type="button"
        onClick={handleToggleReveal}
        disabled={isLogging}
        title={revealed ? 'Hide sensitive data' : 'Reveal sensitive data (logged in audit)'}
        aria-label={revealed ? 'Hide' : 'Reveal'}
        className="p-0.5 rounded text-[#5D5E5F] hover:text-[#17645F] hover:bg-[#F0EFEC] transition-colors cursor-pointer shrink-0"
      >
        {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
};
