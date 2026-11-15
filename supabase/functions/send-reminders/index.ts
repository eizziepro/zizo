// Supabase Edge Function: send-reminders (pg_cron triggered)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'care@zizodonorandsurrogacy.com';
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
  const in1h = new Date(now.getTime() + 3600 * 1000).toISOString();

  // 1. 24-hour reminders
  const { data: due24 } = await supabase
    .from('bookings')
    .select('*, consultation_types(name)')
    .eq('status', 'confirmed')
    .eq('reminder_24h_sent', false)
    .lte('start_at', in24h)
    .gt('start_at', now.toISOString());

  for (const bk of due24 || []) {
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: bk.email,
          subject: `Reminder: Your Zizo Consultation Tomorrow`,
          text: `Hello ${bk.name},\n\nThis is a gentle reminder that your consultation is scheduled for tomorrow at ${new Date(bk.start_at).toUTCString()}.\n\nChannel: ${bk.channel}\n\nWarm regards,\nZizo Care Team`,
        }),
      }).catch((e) => console.error('[send-reminders 24h]', e));
    }
    await supabase.from('bookings').update({ reminder_24h_sent: true }).eq('id', bk.id);
  }

  // 2. 1-hour reminders
  const { data: due1 } = await supabase
    .from('bookings')
    .select('*, consultation_types(name)')
    .eq('status', 'confirmed')
    .eq('reminder_1h_sent', false)
    .lte('start_at', in1h)
    .gt('start_at', now.toISOString());

  for (const bk of due1 || []) {
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: bk.email,
          subject: `Starting Soon: Your Zizo Consultation in 1 Hour`,
          text: `Hello ${bk.name},\n\nYour consultation begins in one hour at ${new Date(bk.start_at).toUTCString()}.\n\nChannel: ${bk.channel}\n\nWarm regards,\nZizo Care Team`,
        }),
      }).catch((e) => console.error('[send-reminders 1h]', e));
    }
    await supabase.from('bookings').update({ reminder_1h_sent: true }).eq('id', bk.id);
  }

  return new Response(JSON.stringify({ ok: true, sent24: (due24 || []).length, sent1: (due1 || []).length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
