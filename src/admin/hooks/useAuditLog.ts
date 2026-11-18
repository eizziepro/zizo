import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = async (params: {
    action: string;
    tableName: string;
    recordId?: string | null;
    diff?: any;
  }) => {
    const actor = user?.email || user?.full_name || 'unknown_staff';
    const payload = {
      actor,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId || null,
      diff: params.diff || null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_log').insert(payload);
      } catch (err) {
        console.error('Failed to write audit log to Supabase:', err);
      }
    } else {
      // Local development audit log cache
      try {
        const existing = JSON.parse(localStorage.getItem('zizo_audit_log') || '[]');
        existing.unshift({ id: 'audit-' + Date.now(), ...payload });
        localStorage.setItem('zizo_audit_log', JSON.stringify(existing.slice(0, 100)));
      } catch {
        // ignore storage errors
      }
    }
  };

  const logRevealPii = async (tableName: string, recordId: string, field: string) => {
    await logAction({
      action: 'REVEAL_PII',
      tableName,
      recordId,
      diff: { field, timestamp: new Date().toISOString() },
    });
  };

  return {
    logAction,
    logRevealPii,
  };
}
